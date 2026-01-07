<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card color="background">
      <v-toolbar color="surface" flat border="bottom">
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="text-h6 font-weight-bold">{{
          isEdit ? t("app.edit") : t("app.add")
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="primary"
          rounded="pill"
          class="px-6 mr-2"
          @click="save"
        >
          {{ t("app.save") }}
        </v-btn>
      </v-toolbar>

      <v-container class="max-width-600 mt-4">
        <v-card variant="flat" border class="rounded-xl pa-4">
          <v-text-field
            v-model="formData.title"
            :label="t('event.title')"
            variant="outlined"
            rounded="lg"
            class="mb-2"
            persistent-placeholder
            placeholder="Type your event title..."
          ></v-text-field>

          <v-text-field
            v-model="formData.date"
            :label="t('event.date')"
            type="date"
            variant="outlined"
            rounded="lg"
            class="mb-2"
          ></v-text-field>

          <div class="text-subtitle-2 mb-2 ml-1 text-grey-darken-1">
            {{ t("event.repeat") }}
          </div>
          <v-btn-toggle
            v-model="formData.repeat"
            mandatory
            color="primary"
            variant="outlined"
            rounded="pill"
            class="mb-6 d-flex flex-wrap"
            style="height: auto"
          >
            <v-btn
              v-for="opt in repeatOptions"
              :key="opt.value"
              :value="opt.value"
              size="small"
              class="flex-grow-1 py-2"
            >
              {{ opt.title }}
            </v-btn>
          </v-btn-toggle>

          <div class="text-subtitle-2 mb-2 ml-1 text-grey-darken-1">
            {{ t("event.bg") }}
          </div>
          <v-file-input
            :label="t('event.bg')"
            accept="image/*"
            @change="onFileChange"
            prepend-inner-icon="mdi-camera"
            prepend-icon=""
            variant="outlined"
            rounded="lg"
            hide-details
            class="mb-4"
          ></v-file-input>

          <v-expand-transition>
            <div v-if="formData.background" class="mt-4">
              <v-img
                :src="formData.background"
                height="180"
                cover
                class="rounded-xl elevation-2 position-relative"
              >
                <v-btn
                  icon="mdi-close"
                  color="black"
                  size="x-small"
                  position="absolute"
                  location="top right"
                  class="ma-2 glass-btn"
                  @click="formData.background = ''"
                ></v-btn>
              </v-img>
            </div>
          </v-expand-transition>
        </v-card>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.max-width-600 {
  max-width: 600px;
  margin: 0 auto;
}
.glass-btn {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(4px);
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CountdownEvent, RepeatType } from "@/stores/types";
import dayjs from "dayjs";

const props = defineProps<{
  modelValue: boolean;
  event?: CountdownEvent;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const { t } = useI18n();

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isEdit = computed(() => !!props.event);

const formData = ref({
  title: "",
  date: dayjs().format("YYYY-MM-DD"),
  repeat: "none" as RepeatType,
  background: "",
});

watch(
  () => props.event,
  (newVal) => {
    if (newVal) {
      formData.value = {
        title: newVal.title,
        date: dayjs(newVal.date).format("YYYY-MM-DD"),
        repeat: newVal.repeat,
        background: newVal.background || "",
      };
    } else {
      formData.value = {
        title: "",
        date: dayjs().format("YYYY-MM-DD"),
        repeat: "none",
        background: "",
      };
    }
  },
  { immediate: true }
);

const repeatOptions = computed(() => [
  { title: t("event.none"), value: "none" },
  { title: t("event.daily"), value: "daily" },
  { title: t("event.weekly"), value: "weekly" },
  { title: t("event.monthly"), value: "monthly" },
  { title: t("event.yearly"), value: "yearly" },
]);

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      formData.value.background = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const save = () => {
  if (!formData.value.title) return;
  emit("save", { ...formData.value });
  dialog.value = false;
};
</script>
