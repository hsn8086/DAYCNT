<template>
  <v-card
    class="event-card mb-4 rounded-lg"
    flat
    :style="cardStyle"
    @click="$emit('click', event)"
    @contextmenu.prevent="$emit('long-press', event)"
    v-ripple
  >
    <div
      class="card-content d-flex flex-column justify-space-between fill-height pa-4"
      :class="{ 'has-bg': !!event.background }"
    >
      <div class="d-flex justify-space-between align-start">
        <div
          class="text-subtitle-1 font-weight-medium text-truncate pr-4 card-title"
        >
          {{ event.title }}
        </div>
        <v-chip
          v-if="isSoon"
          color="error"
          size="x-small"
          variant="flat"
          class="font-weight-bold"
          >{{ t("event.soon") }}</v-chip
        >
      </div>

      <div class="d-flex flex-column align-center">
        <div class="d-flex align-baseline">
          <span class="text-h3 font-weight-bold">{{ timeDisplay }}</span>
          <span
            class="text-caption font-weight-medium ml-1"
            v-if="store.settings.displayFormat === 'days'"
            >{{ t("event.days") }}</span
          >
        </div>
        <div class="text-caption opacity-70 mt-1">
          {{ diffDays >= 0 ? t("event.left") : t("event.passed") }} ·
          {{ formattedDate }}
        </div>
      </div>

      <!-- Spacer for balance -->
      <div></div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import type { CountdownEvent } from "@/stores/types";
import {
  getDiffDays,
  getIsSoon,
  getTargetDate,
  formatTimeDiff,
} from "@/utils/date";

const props = defineProps<{
  event: CountdownEvent;
}>();

defineEmits(["click", "long-press"]);

const store = useAppStore();
const { t } = useI18n();

const timeDisplay = computed(() =>
  formatTimeDiff(props.event, store.settings.displayFormat)
);

const diffDays = computed(() => getDiffDays(props.event));

const isSoon = computed(() => getIsSoon(props.event));

const formattedDate = computed(() => {
  return getTargetDate(props.event).format("YYYY-MM-DD");
});

const cardStyle = computed(() => {
  if (props.event.background) {
    return {
      backgroundImage: `url(${props.event.background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "160px",
      position: "relative" as const,
    };
  }
  return {
    height: "160px",
    position: "relative" as const,
    backgroundColor: store.settings.theme === "dark" ? "#1E1E1E" : "#F5F5F5",
  };
});
</script>

<style scoped>
.event-card {
  cursor: pointer;
  transition: opacity 0.2s;
}
.event-card:active {
  opacity: 0.8;
}

.card-content {
  color: inherit;
}

.card-content.has-bg {
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
}

.opacity-70 {
  opacity: 0.7;
}
</style>
