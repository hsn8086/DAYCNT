<template>
  <v-app-bar color="primary">
    <v-toolbar-title>{{ t("app.title") }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon @click="showSettings = true">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main>
    <router-view />
  </v-main>

  <v-dialog
    v-model="showSettings"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <SettingsView @close="showSettings = false" />
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import SettingsView from "@/components/SettingsView.vue";

const { t } = useI18n();
const showSettings = ref(false);
</script>
