<template>
  <q-card class="support-facebook-card clickable shadow-2" v-ripple @click="onCardClick">
    <q-card-section class="q-pa-md">
      <div class="row items-center no-wrap">
        <div class="avatar-container q-mr-md">
          <q-avatar size="56px" class="support-avatar">
            <q-img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" />
            <div class="status-indicator online"></div>
          </q-avatar>
        </div>
        <div class="col">
          <div class="support-name text-weight-bold">Soporte OrderWise</div>
          <div class="support-status row items-center">
            <span class="status-text">Disponible ahora</span>
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            round
            flat
            dense
            icon="fab fa-facebook-messenger"
            color="primary"
            class="messenger-icon-btn"
            style="pointer-events: none"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none q-px-md q-pb-md">
      <div class="cta-container">
        <q-btn
          unelevated
          color="primary"
          label="Enviar mensaje"
          class="full-width messenger-btn"
          no-caps
          style="pointer-events: none"
        >
          <template v-slot:loading>
            <q-spinner-dots />
          </template>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
const emit = defineEmits(['click'])

const onCardClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.support-facebook-card {
  width: 100%;
  max-width: 350px;
  border-radius: 12px;
  background: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
  }
}

.support-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  z-index: 1;

  &.online {
    background-color: #31a24c;
  }
}

.support-name {
  font-size: 16px;
  color: #050505;
  letter-spacing: -0.2px;
}

.status-text {
  font-size: 13px;
  color: #65676b;
}

.messenger-btn {
  border-radius: 8px;
  font-weight: 600;
  height: 40px;
  background: #0084ff !important;

  &:hover {
    background: #0073e6 !important;
  }
}

.messenger-icon-btn {
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

/* Dark mode adjustments if needed */
.body--dark {
  .support-facebook-card {
    background: #242526;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .support-name {
    color: #e4e6eb;
  }

  .status-text {
    color: #b0b3b8;
  }
}
</style>
