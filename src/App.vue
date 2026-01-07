<template>
  <v-app :theme="store.settings.theme">
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/zh-cn";

dayjs.extend(localizedFormat);

const store = useAppStore();
const { locale } = useI18n();

onMounted(() => {
  store.init();
  locale.value = store.settings.language;
  dayjs.locale(store.settings.language === "zh" ? "zh-cn" : "en");
});
</script>
