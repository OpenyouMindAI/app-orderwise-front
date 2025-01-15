<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card style="max-width: 80vh; width: 400px;">
      <q-card-section>
        <div class="text-h6 flex items-center q-gutter-x-sm full-width">
          <q-icon name="warning" color="warning"/>
          <span>
            Suscripción expirada
          </span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="column q-gutter-md">
          <span class="text-subtitle1">
            Tu acceso {{ data?.plan?.name }} ha terminado
          </span>
          <div class="column justify-center items-center">
            <q-icon name="schedule" class="text-h1"/>
            <span class="text-body2 text-center">
              Tu suscripción ha expirado hace {{ data?.subscription_missing }} días.
              Renueva ahora y recupera todos los beneficios de tu plan {{ data?.plan?.name }}.
            </span>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="Renovar suscripción" color="primary" v-close-popup icon-right="arrow_forward"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>

const modelValue = defineModel({ required: true })

defineProps({
  data: {
    type: Object,
    required: true
  }
})

</script>
