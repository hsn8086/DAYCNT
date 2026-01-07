<template>
  <v-card flat>
    <v-toolbar color="surface" density="compact" border="bottom">
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title class="text-subtitle-1 font-weight-bold">{{
        t("app.settings")
      }}</v-toolbar-title>
    </v-toolbar>

    <v-list lines="two" bg-color="background">
      <v-list-subheader>{{ t("settings.theme") }}</v-list-subheader>
      <v-list-item>
        <template v-slot:prepend>
          <v-icon>mdi-theme-light-dark</v-icon>
        </template>
        <v-list-item-title class="mr-4">{{
          t("settings.theme")
        }}</v-list-item-title>
        <template v-slot:append>
          <v-btn-toggle
            v-model="currentTheme"
            mandatory
            color="primary"
            variant="flat"
            density="compact"
            class="rounded-pill border"
            @update:model-value="onThemeChange"
          >
            <v-btn
              value="light"
              size="small"
              :prepend-icon="'mdi-white-balance-sunny'"
              >{{ t("settings.light") }}</v-btn
            >
            <v-btn
              value="dark"
              size="small"
              :prepend-icon="'mdi-moon-waning-crescent'"
              >{{ t("settings.dark") }}</v-btn
            >
          </v-btn-toggle>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-subheader>{{ t("settings.language") }}</v-list-subheader>
      <v-list-item>
        <template v-slot:prepend>
          <v-icon>mdi-translate</v-icon>
        </template>
        <v-select
          v-model="store.settings.language"
          :items="languages"
          item-title="title"
          item-value="value"
          variant="underlined"
          hide-details
          @update:model-value="changeLanguage"
        ></v-select>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-subheader>{{ t("settings.displayFormat") }}</v-list-subheader>
      <v-list-item>
        <v-radio-group
          v-model="store.settings.displayFormat"
          @update:model-value="store.save()"
        >
          <v-radio :label="t('settings.formatDays')" value="days"></v-radio>
          <v-radio
            :label="t('settings.formatMonthDay')"
            value="month-day"
          ></v-radio>
          <v-radio
            :label="t('settings.formatYearMonthDay')"
            value="year-month-day"
          ></v-radio>
        </v-radio-group>
      </v-list-item>

      <v-divider></v-divider>
      <v-list-item>
        <v-btn block color="primary" @click="exportData"
          >{{ t("app.export") }} JSON</v-btn
        >
        <v-btn block class="mt-2" @click="triggerImport"
          >{{ t("app.import") }} JSON</v-btn
        >
        <input
          type="file"
          ref="fileInput"
          hidden
          @change="importData"
          accept=".json"
        />
      </v-list-item>

      <v-divider></v-divider>

      <v-list-subheader>{{ t("sync.title") }}</v-list-subheader>
      <v-list-item>
        <v-expansion-panels>
          <v-expansion-panel :title="t('sync.webdav')">
            <v-expansion-panel-text>
              <v-text-field
                v-model="store.settings.sync.webdav!.url"
                label="URL"
                placeholder="https://example.com/dav/"
              ></v-text-field>
              <v-text-field
                v-model="store.settings.sync.webdav!.username"
                label="Username"
              ></v-text-field>
              <v-text-field
                v-model="store.settings.sync.webdav!.password"
                label="Password"
                type="password"
              ></v-text-field>
              <div class="d-flex gap-2">
                <v-btn size="small" @click="doSync('webdav', 'upload')">{{
                  t("sync.syncNow")
                }}</v-btn>
                <v-btn size="small" @click="doSync('webdav', 'download')">{{
                  t("sync.pullNow")
                }}</v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel :title="t('sync.gist')">
            <v-expansion-panel-text>
              <v-text-field
                v-model="store.settings.sync.gist!.token"
                label="GitHub Token"
              ></v-text-field>
              <v-text-field
                v-model="store.settings.sync.gist!.gistId"
                label="Gist ID"
              ></v-text-field>
              <div class="d-flex gap-2">
                <v-btn size="small" @click="doSync('gist', 'upload')">{{
                  t("sync.syncNow")
                }}</v-btn>
                <v-btn size="small" @click="doSync('gist', 'download')">{{
                  t("sync.pullNow")
                }}</v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel :title="t('sync.url')">
            <v-expansion-panel-text>
              <v-text-field
                v-model="store.settings.sync.customUrl"
                label="HTTPS URL"
              ></v-text-field>
              <v-btn size="small" @click="doSync('url', 'download')">{{
                t("sync.pullNow")
              }}</v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-list-item>
    </v-list>

    <v-snackbar v-model="snackbar">{{ snackbarText }}</v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify";
import { saveAs } from "file-saver";
import {
  uploadToWebDav,
  downloadFromWebDav,
  uploadToGist,
  downloadFromGist,
  downloadFromUrl,
} from "@/utils/sync";
import dayjs from "dayjs";

defineEmits(["close"]);

const store = useAppStore();
const { t, locale } = useI18n();
const theme = useTheme();

const currentTheme = ref(store.settings.theme);
const snackbar = ref(false);
const snackbarText = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const languages = [
  { title: "简体中文", value: "zh" },
  { title: "English", value: "en" },
];

onMounted(() => {
  // Ensure sync objects exist
  if (!store.settings.sync.webdav)
    store.settings.sync.webdav = { url: "", username: "", password: "" };
  if (!store.settings.sync.gist)
    store.settings.sync.gist = { token: "", gistId: "" };
});

const onThemeChange = (val: "light" | "dark") => {
  store.updateSettings({ theme: val });
  theme.global.name.value = val;
};

const changeLanguage = (val: any) => {
  locale.value = val;
  store.updateSettings({ language: val });
  dayjs.locale(val === "zh" ? "zh-cn" : "en");
};

const exportData = () => {
  const blob = new Blob([JSON.stringify(store.events, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, "events.json");
};

const triggerImport = () => {
  fileInput.value?.click();
};

const importData = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        store.importEvents(data);
        showSnack("Import Success");
      } catch (err) {
        showSnack("Import Failed");
      }
    };
    reader.readAsText(file);
  }
};

const doSync = async (
  type: "webdav" | "gist" | "url",
  action: "upload" | "download"
) => {
  try {
    if (type === "webdav") {
      if (action === "upload")
        await uploadToWebDav(store.settings.sync.webdav, store.events);
      else
        store.importEvents(
          await downloadFromWebDav(store.settings.sync.webdav)
        );
    } else if (type === "gist") {
      if (action === "upload")
        await uploadToGist(store.settings.sync.gist, store.events);
      else store.importEvents(await downloadFromGist(store.settings.sync.gist));
    } else if (type === "url") {
      if (store.settings.sync.customUrl) {
        store.importEvents(
          await downloadFromUrl(store.settings.sync.customUrl)
        );
      }
    }
    showSnack("Sync Success");
  } catch (err) {
    console.error(err);
    showSnack("Sync Failed");
  }
};

const showSnack = (text: string) => {
  snackbarText.value = text;
  snackbar.value = true;
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
