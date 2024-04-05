<template>
  <div class="q-pa-xs">
    <q-card flat style="border-radius: 10px;">
      <q-skeleton height="100px" square />

      <q-card-section class="q-pa-xs">
        <q-skeleton type="text" class="text-subtitle1" />
        <div class="flex justify-between">
          <q-skeleton type="text" width="45%" class="text-subtitle1" />
          <q-skeleton type="text" width="45%" class="text-subtitle1" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
