<template>
  <div class="q-pa-md">
    <!-- Header Skeleton -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center">
          <q-skeleton type="QBtn" size="32px" round class="q-mr-sm" />
          <q-skeleton type="rect" width="150px" height="32px" />
        </div>
        <q-skeleton type="text" width="250px" class="q-mt-xs" />
      </div>
      <div class="row q-gutter-sm">
        <q-skeleton type="QBtn" width="130px" height="36px" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left Panel Skeleton -->
      <div class="col-12 col-sm-4 col-md-4">
        <!-- Configuration Card -->
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-skeleton type="QAvatar" size="24px" class="q-mr-sm" />
              <q-skeleton type="rect" width="180px" height="24px" />
            </div>

            <!-- Inputs -->
            <div v-for="i in 4" :key="'input-' + i" class="q-mb-md">
              <q-skeleton type="QInput" height="40px" />
            </div>
            <q-skeleton type="rect" height="80px" />
          </q-card-section>
        </q-card>

        <!-- Add Client Card -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-skeleton type="QAvatar" size="24px" class="q-mr-sm" />
              <q-skeleton type="rect" width="150px" height="24px" />
            </div>
            <q-skeleton type="QInput" height="40px" class="q-mb-md" />
            <q-skeleton type="QBtn" class="full-width" height="36px" />
          </q-card-section>
        </q-card>

        <!-- Stops List Card -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="col">
                <q-skeleton type="rect" width="160px" height="24px" />
                <q-skeleton type="text" width="100px" class="q-mt-xs" />
              </div>
              <q-skeleton type="QBtn" width="100px" height="28px" />
            </div>

            <!-- Stop Items -->
            <div v-for="i in 3" :key="'stop-' + i" class="q-mb-sm">
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center no-wrap">
                    <q-skeleton type="QAvatar" size="24px" class="q-mr-sm" />
                    <q-skeleton type="QAvatar" size="28px" class="q-mr-sm" />
                    <div class="col">
                      <q-skeleton type="text" width="70%" />
                      <q-skeleton type="text" width="40%" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Panel Skeleton (Map) -->
      <div class="col-12 col-sm-8 col-md-8">
        <q-card flat bordered style="height: calc(100vh - 120px);">
          <q-skeleton height="100%" square />
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * DeliveryRouteBuilderSkeleton
 * Provides a loading state visual for the DeliveryRouteBuilder page
 */
</script>

<style scoped>
/* Ensure skeleton cards match the look of the actual components */
.q-card {
  border-radius: 8px;
}
</style>
