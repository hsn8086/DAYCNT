<template>
  <v-container class="fill-height align-start px-4">
    <v-row>
      <v-col cols="12" class="d-flex align-center py-2">
        <v-slide-x-transition>
          <v-text-field
            v-if="showSearch"
            v-model="search"
            :placeholder="t('app.search')"
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            variant="solo-filled"
            rounded="pill"
            class="mr-2"
            autofocus
            @blur="search === '' ? (showSearch = false) : null"
          ></v-text-field>
        </v-slide-x-transition>

        <v-spacer v-if="!showSearch"></v-spacer>

        <div class="d-flex align-center">
          <v-btn
            v-if="!showSearch"
            icon
            variant="text"
            @click="showSearch = true"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn icon variant="text" v-bind="props">
                <v-icon>mdi-sort-variant</v-icon>
              </v-btn>
            </template>
            <v-list rounded="lg" elevation="4">
              <v-list-item @click="sortBy = 'date'" :active="sortBy === 'date'">
                <template v-slot:prepend
                  ><v-icon size="small">mdi-calendar</v-icon></template
                >
                <v-list-item-title class="ml-2">{{
                  t("app.sort.date")
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                @click="sortBy = 'createdAt'"
                :active="sortBy === 'createdAt'"
              >
                <template v-slot:prepend
                  ><v-icon size="small">mdi-clock</v-icon></template
                >
                <v-list-item-title class="ml-2">{{
                  t("app.sort.createAt")
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-col>

      <v-col
        v-for="event in paginatedEvents"
        :key="event.id"
        cols="12"
        sm="6"
        md="4"
      >
        <EventCard
          :event="event"
          @click="openDetail(event)"
          @long-press="handleLongPress"
        />
      </v-col>

      <v-col cols="12" class="d-flex justify-center mt-6" v-if="totalPages > 1">
        <v-pagination
          v-model="page"
          :length="totalPages"
          density="comfortable"
          variant="flat"
          rounded="circle"
        ></v-pagination>
      </v-col>
    </v-row>

    <!-- FAB for adding -->
    <v-btn
      color="primary"
      size="x-large"
      icon="mdi-plus"
      position="fixed"
      location="bottom right"
      elevation="8"
      class="ma-6 fab-btn"
      @click="showAddForm = true"
    ></v-btn>

    <EventForm v-model="showAddForm" @save="handleAdd" />

    <v-bottom-sheet v-model="showQuickActions">
      <v-list>
        <v-list-item @click="quickEdit" prepend-icon="mdi-pencil">{{
          t("app.edit")
        }}</v-list-item>
        <v-list-item
          @click="quickDelete"
          prepend-icon="mdi-delete"
          base-color="error"
          >{{ t("app.delete") }}</v-list-item
        >
      </v-list>
    </v-bottom-sheet>

    <v-dialog
      v-model="detailDialog"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selectedEvent" color="background">
        <v-toolbar color="surface" flat border="bottom">
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="font-weight-bold">{{
            selectedEvent.title
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showEditForm = true">
            <v-icon color="primary">mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="error"
            @click="confirmDelete = true"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </v-toolbar>

        <v-container
          class="d-flex flex-column align-center justify-center py-12 fill-height"
        >
          <v-card
            id="detail-screenshot-target"
            :style="detailCardStyle"
            flat
            class="detail-card-hero rounded-lg d-flex flex-column justify-center align-center overflow-hidden"
          >
            <div class="glass-overlay" v-if="selectedEvent.background"></div>
            <div
              class="content-z py-10 px-6 text-center"
              :class="{ 'text-white': !!selectedEvent.background }"
            >
              <div class="text-overline mb-2 opacity-70 tracking-widest">
                {{ t("event.detail").toUpperCase() }}
              </div>
              <div class="text-h4 font-weight-bold mb-6">
                {{ selectedEvent.title }}
              </div>

              <div class="d-flex align-baseline justify-center mb-2">
                <span
                  class="font-weight-black tracking-tight"
                  :class="{
                    'text-h1': timeDisplayLength <= 3,
                    'text-h2': timeDisplayLength === 4,
                    'text-h3': timeDisplayLength > 4,
                  }"
                  >{{
                    formatTimeDiff(selectedEvent, store.settings.displayFormat)
                  }}</span
                >
                <span
                  class="text-h5 ml-2 font-weight-medium"
                  v-if="store.settings.displayFormat === 'days'"
                  >{{ t("event.days").toUpperCase() }}</span
                >
              </div>

              <v-divider
                class="my-6 border-opacity-25"
                :color="selectedEvent.background ? 'white' : undefined"
              ></v-divider>

              <div class="text-h6 font-weight-light opacity-90">
                {{ getTargetDate(selectedEvent).format("LL") }}
              </div>
              <div class="text-caption mt-2 opacity-60">
                {{
                  selectedEvent.repeat !== "none"
                    ? t(`event.${selectedEvent.repeat}`)
                    : ""
                }}
              </div>
            </div>
          </v-card>

          <div class="mt-12 d-flex flex-wrap justify-center gap-4">
            <v-btn
              variant="tonal"
              prepend-icon="mdi-camera-outline"
              rounded="pill"
              size="large"
              class="px-8"
              @click="takeScreenshot"
            >
              {{ t("app.export") }} PNG
            </v-btn>
            <v-btn
              variant="tonal"
              prepend-icon="mdi-calendar-export"
              rounded="pill"
              size="large"
              class="px-8"
              @click="exportIcs"
            >
              {{ t("app.export") }} ICS
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <EventForm
      :event="selectedEvent || undefined"
      v-model="showEditForm"
      @save="handleEdit"
    />

    <v-dialog v-model="confirmDelete" max-width="300">
      <v-card>
        <v-card-title>{{ t("app.confirm") }}</v-card-title>
        <v-card-text>{{ t("app.delete") }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDelete = false">{{
            t("app.cancel")
          }}</v-btn>
          <v-btn color="error" variant="text" @click="deleteConfirm">{{
            t("app.confirm")
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import EventCard from "@/components/EventCard.vue";
import EventForm from "@/components/EventForm.vue";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { createEvent, type EventAttributes } from "ics";
import type { CountdownEvent } from "@/stores/types";
import { getDiffDays, getTargetDate, formatTimeDiff } from "@/utils/date";

const store = useAppStore();
const { t } = useI18n();

const search = ref("");
const showSearch = ref(false);
const sortBy = ref<"date" | "createdAt">("date");
const page = ref(1);
const itemsPerPage = 10;

const showAddForm = ref(false);
const showEditForm = ref(false);
const detailDialog = ref(false);
const confirmDelete = ref(false);
const showQuickActions = ref(false);
const selectedEvent = ref<CountdownEvent | null>(null);

onMounted(() => {
  store.init();
});

const handleLongPress = (event: CountdownEvent) => {
  selectedEvent.value = event;
  showQuickActions.value = true;
};

const quickEdit = () => {
  showQuickActions.value = false;
  showEditForm.value = true;
};

const quickDelete = () => {
  showQuickActions.value = false;
  confirmDelete.value = true;
};

const filteredEvents = computed(() => {
  let list = store.events.filter((e) =>
    e.title.toLowerCase().includes(search.value.toLowerCase())
  );

  list.sort((a, b) => {
    if (sortBy.value === "date") {
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    }
    return b.createdAt - a.createdAt;
  });

  return list;
});

const totalPages = computed(() =>
  Math.ceil(filteredEvents.value.length / itemsPerPage)
);
const paginatedEvents = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredEvents.value.slice(start, start + itemsPerPage);
});

const openDetail = (event: CountdownEvent) => {
  selectedEvent.value = event;
  detailDialog.value = true;
};

const handleAdd = (data: any) => {
  store.addEvent(data);
};

const handleEdit = (data: any) => {
  if (selectedEvent.value) {
    store.updateEvent({ ...selectedEvent.value, ...data });
  }
};

const deleteConfirm = () => {
  if (selectedEvent.value) {
    store.deleteEvent(selectedEvent.value.id);
    detailDialog.value = false;
    confirmDelete.value = false;
    selectedEvent.value = null;
  }
};

const detailCardStyle = computed(() => {
  if (selectedEvent.value?.background) {
    return {
      backgroundImage: `url(${selectedEvent.value.background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100%",
      maxWidth: "400px",
      aspectRatio: "1",
      position: "relative" as const,
    };
  }
  return {
    backgroundColor: store.settings.theme === "dark" ? "#1E1E1E" : "#F5F5F5",
    width: "100%",
    maxWidth: "400px",
    aspectRatio: "1",
    position: "relative" as const,
  };
});

const timeDisplayLength = computed(() => {
  if (!selectedEvent.value) return 0;
  return formatTimeDiff(selectedEvent.value, store.settings.displayFormat)
    .length;
});

const takeScreenshot = async () => {
  const element = document.getElementById("detail-screenshot-target");
  if (element) {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `${selectedEvent.value?.title || "event"}.png`);
    });
  }
};

const exportIcs = () => {
  if (!selectedEvent.value) return;
  const d = dayjs(selectedEvent.value.date);
  const event: EventAttributes = {
    start: [d.year(), d.month() + 1, d.date()],
    duration: { hours: 24 },
    title: selectedEvent.value.title,
    description: "Countdown event",
  };

  createEvent(event, (error, value) => {
    if (!error) {
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, `${selectedEvent.value?.title}.ics`);
    }
  });
};
</script>

<style scoped>
.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}
.content-z {
  position: relative;
  z-index: 2;
  width: 100%;
}
.gap-4 {
  display: flex;
  gap: 16px;
}
.fab-btn {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fab-btn:hover {
  transform: scale(1.1) rotate(90deg);
}
.tracking-tight {
  letter-spacing: -0.05em;
}
.tracking-widest {
  letter-spacing: 0.2em;
}
</style>
