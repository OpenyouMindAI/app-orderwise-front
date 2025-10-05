<template>
  <q-page class="modern-page">
    <!-- Animated Header with Gradient -->
    <div class="header-card animate-slide-down">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="flex items-center q-gutter-md">
              <div class="icon-wrapper">
                <q-icon name="analytics" size="48px" class="text-white" />
              </div>
              <div>
                <div class="header-title">
                  Comparación de Ventas vs Arqueos
                </div>
                <div class="header-subtitle">
                  Control inteligente de caja • Verifica que todo cuadre perfectamente
                </div>
              </div>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              unelevated
              rounded
              color="white"
              text-color="primary"
              icon="help_outline"
              label="Ayuda"
              @click="showHelp = true"
              class="help-button"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Filters Card -->
    <div class="filters-card-compact animate-fade-in">
      <div class="filters-header-compact">
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gutter-sm">
            <q-icon name="tune" size="20px" color="primary" />
            <span class="filters-title-compact">Filtros</span>
          </div>
          <q-btn
            flat
            dense
            round
            :icon="showFilters ? 'expand_less' : 'expand_more'"
            color="primary"
            @click="showFilters = !showFilters"
          >
            <q-tooltip>{{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-slide-transition>
        <div v-show="showFilters" class="filters-content-compact">
        <!-- Compact Date Range -->
        <div class="row q-col-gutter-sm items-center q-mb-sm">
          <!-- Quick Date Buttons -->
          <div class="col-auto">
            <q-btn-group unelevated class="date-btn-group">
              <q-btn
                :unelevated="isCurrentMonth"
                :outline="!isCurrentMonth"
                :color="isCurrentMonth ? 'primary' : 'grey-4'"
                :text-color="isCurrentMonth ? 'white' : 'grey-7'"
                icon="today"
                label="Mes Actual"
                size="md"
                @click="setCurrentMonth"
                no-caps
                class="date-filter-btn"
              />
              <q-btn
                :unelevated="isPreviousMonth"
                :outline="!isPreviousMonth"
                :color="isPreviousMonth ? 'primary' : 'grey-4'"
                :text-color="isPreviousMonth ? 'white' : 'grey-7'"
                icon="event"
                label="Mes Anterior"
                size="md"
                @click="setPreviousMonth"
                no-caps
                class="date-filter-btn"
              />
              <q-btn
                :unelevated="isToday"
                :outline="!isToday"
                :color="isToday ? 'primary' : 'grey-4'"
                :text-color="isToday ? 'white' : 'grey-7'"
                icon="calendar_today"
                label="Hoy"
                size="md"
                @click="setToday"
                no-caps
                class="date-filter-btn"
              />
            </q-btn-group>
          </div>

          <!-- Date Range Inputs -->
          <div class="col-auto">
            <div class="row q-gutter-xs items-center">
              <q-input
                v-model="dateFrom"
                outlined
                dense
                readonly
                bg-color="white"
                class="date-input-compact"
              >
                <template v-slot:prepend>
                  <q-icon name="event" size="18px" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon name="edit_calendar" size="16px" color="primary" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="dateFrom"
                        @update:model-value="loadData"
                        mask="YYYY-MM-DD"
                        color="primary"
                      >
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="OK" color="primary" flat size="sm" />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-icon name="arrow_forward" size="16px" color="grey-5" />
              <q-input
                v-model="dateTo"
                outlined
                dense
                readonly
                bg-color="white"
                class="date-input-compact"
              >
                <template v-slot:prepend>
                  <q-icon name="event" size="18px" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon name="edit_calendar" size="16px" color="primary" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="dateTo"
                        @update:model-value="loadData"
                        mask="YYYY-MM-DD"
                        color="primary"
                      >
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="OK" color="primary" flat size="sm" />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Additional Filters -->
        <div class="row q-col-gutter-sm">
          <!-- Branch Office Filter -->
          <div class="col-12 col-sm-6">
            <q-select
              v-model="filters.branch_office_ids"
              :options="branchOffices"
              option-value="id"
              option-label="name"
              label="Sucursales"
              multiple
              clearable
              use-chips
              outlined
              dense
              bg-color="white"
              class="filter-select-compact"
              @update:model-value="debouncedLoadData"
              :loading="loadingBranches"
            >
              <template v-slot:prepend>
                <q-icon name="store" size="18px" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Payment Method Filter -->
          <div class="col-12 col-sm-6">
            <q-select
              v-model="filters.payment_method_ids"
              :options="paymentMethods"
              option-value="id"
              option-label="name"
              label="Métodos de Pago"
              multiple
              clearable
              use-chips
              outlined
              dense
              bg-color="white"
              class="filter-select-compact"
              @update:model-value="debouncedLoadData"
              :loading="loadingPaymentMethods"
            >
              <template v-slot:prepend>
                <q-icon name="payment" size="18px" color="primary" />
              </template>
            </q-select>
          </div>
        </div>
        </div>
      </q-slide-transition>
    </div>

    <!-- Modern Summary Cards with Animations -->
    <div class="stats-grid">
      <!-- Sales Card -->
      <div class="stat-card-compact stat-card-success animate-scale-in" style="animation-delay: 0.1s;">
        <div class="stat-card-bg">
          <div class="stat-card-circle"></div>
        </div>
        <div class="stat-card-content-compact">
          <div class="stat-icon-wrapper-compact success">
            <q-icon name="trending_up" size="24px" />
          </div>
          <div class="stat-info-compact">
            <div class="stat-label-compact">Ventas del Período</div>
            <div class="stat-value-compact">{{ formatCurrencyCompact(totalsAmount.paid_sales) }}</div>
            <div class="stat-description-compact">Total facturado en ventas</div>
          </div>
        </div>
        <div class="stat-card-shine"></div>
      </div>

      <!-- Withdrawals Card -->
      <div class="stat-card-compact stat-card-info animate-scale-in" style="animation-delay: 0.2s;">
        <div class="stat-card-bg">
          <div class="stat-card-circle"></div>
        </div>
        <div class="stat-card-content-compact">
          <div class="stat-icon-wrapper-compact info">
            <q-icon name="account_balance_wallet" size="24px" />
          </div>
          <div class="stat-info-compact">
            <div class="stat-label-compact">Arqueos Realizados</div>
            <div class="stat-value-compact">{{ formatCurrencyCompact(totalsAmount.sum_amount) }}</div>
            <div class="stat-description-compact">Total retirado en arqueos</div>
          </div>
        </div>
        <div class="stat-card-shine"></div>
      </div>

      <!-- Difference Card with Dynamic Status -->
      <div
        class="stat-card-compact animate-scale-in"
        :class="`stat-card-${getDifferenceStatus().colorClass}`"
        style="animation-delay: 0.3s;"
      >
        <div class="stat-card-bg">
          <div class="stat-card-circle"></div>
        </div>
        <div class="stat-card-content-compact">
          <div class="stat-icon-wrapper-compact" :class="getDifferenceStatus().colorClass">
            <q-icon :name="getDifferenceStatus().iconName" size="24px" />
          </div>
          <div class="stat-info-compact">
            <div class="stat-label-compact">Diferencia</div>
            <div class="stat-value-compact">{{ formatCurrencyCompact(Math.abs(totalsAmount.difference_report || 0)) }}</div>
            <div class="stat-description-compact">{{ getDifferenceStatus().label }}</div>
          </div>
        </div>
        <div class="stat-card-shine"></div>
        <div v-if="Math.abs(totalsAmount.difference_report || 0) < 0.01" class="stat-badge-compact">
          <q-icon name="verified" size="14px" /> Perfecto
        </div>
      </div>

      <!-- Days Card -->
      <div class="stat-card-compact stat-card-purple animate-scale-in" style="animation-delay: 0.4s;">
        <div class="stat-card-bg">
          <div class="stat-card-circle"></div>
        </div>
        <div class="stat-card-content-compact">
          <div class="stat-icon-wrapper-compact purple">
            <q-icon name="event_available" size="24px" />
          </div>
          <div class="stat-info-compact">
            <div class="stat-label-compact">Días Consultados</div>
            <div class="stat-value-compact">{{ daysData.length }}</div>
            <div class="stat-description-compact">Días con movimientos</div>
          </div>
        </div>
        <div class="stat-card-shine"></div>
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="q-gutter-md">
      <q-skeleton height="100px" class="rounded-borders" />
      <q-skeleton height="300px" class="rounded-borders" />
    </div>

    <!-- Empty State -->
    <q-card v-else-if="!hasData" flat class="text-center q-pa-xl shadow-2 bg-white">
      <q-icon name="search_off" size="80px" color="grey-4" />
      <div class="text-h6 text-weight-bold q-mt-md q-mb-sm">No hay datos para mostrar</div>
      <div class="text-body2 text-grey-7" style="max-width: 400px; margin: 0 auto;">
        No se encontraron ventas ni arqueos en el período seleccionado.<br>
        Intenta cambiar las fechas o los filtros.
      </div>
      <q-btn
        outline
        color="primary"
        label="Ver mes actual"
        icon="refresh"
        class="q-mt-md"
        @click="setCurrentMonth"
      />
    </q-card>

    <!-- Daily Comparison Cards -->
    <div v-else class="q-gutter-md">
      <q-card
        v-for="day in daysData"
        :key="day.day"
        class="shadow-2"
      >
        <!-- Day Header with Status -->
        <q-card-section
          class="cursor-pointer"
          :class="getDayStatusClass(day)"
          @click="toggleExpanded(day.day)"
        >
          <div class="row items-center justify-between">
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <q-icon
                  :name="getDayStatusIcon(day)"
                  size="32px"
                  :color="getDayStatusColor(day)"
                />
                <div>
                  <div class="text-subtitle1 text-weight-bold">
                    {{ formatDate(`${day.day} 00:00:00`) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ getDayStatusText(day) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-auto">
              <div class="row q-gutter-md items-center">
                <!-- Sales -->
                <div class="text-right">
                  <div class="text-caption text-grey-7">Ventas</div>
                  <div class="text-h6 text-weight-bold text-positive">
                    {{ formatCurrency(day.paid_sales) }}
                  </div>
                </div>

                <!-- Withdrawals -->
                <div class="text-right">
                  <div class="text-caption text-grey-7">Arqueos</div>
                  <div class="text-h6 text-weight-bold text-blue">
                    {{ formatCurrency(day.sum_amount) }}
                  </div>
                </div>

                <!-- Difference -->
                <div class="text-right" style="min-width: 120px;">
                  <div class="text-caption text-grey-7">Diferencia</div>
                  <div
                    class="text-h6 text-weight-bold"
                    :class="getDifferenceClass(day.difference_report)"
                  >
                    {{ formatCurrency(Math.abs(day.difference_report || 0)) }}
                  </div>
                </div>

                <!-- Expand Button -->
                <q-btn
                  flat
                  round
                  :icon="expandedRows.has(day.day) ? 'expand_less' : 'expand_more'"
                  color="primary"
                >
                  <q-tooltip>{{ expandedRows.has(day.day) ? 'Ocultar' : 'Ver' }} detalles</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Expandable Details Section -->
        <q-slide-transition>
          <div v-show="expandedRows.has(day.day)">
            <q-separator />
            <q-card-section class="bg-grey-1">
              <div class="q-gutter-md">
                <!-- Cashbox Details -->
                <div
                  v-for="cashbox in day.cashboxes"
                  :key="cashbox.cashbox_user_id"
                  class="bg-white rounded-borders q-pa-md"
                >
                  <div class="row items-center justify-between q-mb-md">
                    <div>
                      <div class="text-subtitle1 text-weight-bold">
                        🏦 {{ cashbox.cashbox.name }}
                      </div>
                      <div v-if="cashbox.user" class="text-caption text-grey-7">
                        Cajero: {{ cashbox.user.name }}
                      </div>
                    </div>
                    <q-btn
                      outline
                      color="primary"
                      icon="add"
                      label="Agregar Arqueo"
                      size="sm"
                      @click="openCashflowModal(cashbox)"
                    />
                  </div>

                  <!-- Withdrawal Items - Compact Design -->
                  <div class="withdrawals-list-compact">
                    <div
                      v-for="withdrawal in cashbox.withdrawals"
                      :key="withdrawal.id"
                      class="withdrawal-row"
                    >
                      <!-- Left: Time and Info -->
                      <div class="withdrawal-info">
                        <div class="withdrawal-time-compact">
                          <q-icon name="schedule" size="14px" />
                          {{ withdrawal.time }}
                        </div>
                        <div class="withdrawal-payment-compact">
                          <q-icon name="credit_card" size="14px" />
                          {{ withdrawal.payment_method_name || 'Sin método' }}
                        </div>
                      </div>

                      <!-- Center: Amounts -->
                      <div class="withdrawal-amounts-compact">
                        <div class="amount-compact expected-compact">
                          <span class="amount-label-compact">Esperado</span>
                          <span class="amount-value-compact">{{ formatCurrency(withdrawal.amount) }}</span>
                        </div>
                        
                        <q-icon name="arrow_forward" size="16px" color="grey-5" class="amount-arrow-compact" />
                        
                        <div class="amount-compact actual-compact">
                          <span class="amount-label-compact">Contado</span>
                          <q-input
                            v-model.number="withdrawal.actual_amount"
                            type="number"
                            outlined
                            dense
                            class="amount-input-compact"
                            prefix="$"
                            placeholder="Monto"
                          />
                        </div>
                      </div>

                      <!-- Right: Actions -->
                      <div class="withdrawal-actions-compact">
                        <q-btn
                          unelevated
                          color="primary"
                          icon="save"
                          size="sm"
                          round
                          class="save-btn-compact"
                          :loading="savingWithdrawalId === withdrawal.id"
                          :disable="savingWithdrawalId === withdrawal.id"
                          @click="updateWithdrawal(withdrawal)"
                        >
                          <q-tooltip>Guardar</q-tooltip>
                        </q-btn>

                        <q-btn
                          v-if="withdrawal.images && withdrawal.images.length > 0"
                          flat
                          color="blue"
                          icon="photo"
                          size="sm"
                          round
                          @click="openFileWithdrawal(withdrawal)"
                        >
                          <q-tooltip>Ver imagen</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Cashflow Modal -->
    <CashflowModal
      v-model="showCashflowModal"
      :payment-methods="paymentMethods"
      :cash-box-state="null"
      :branch-office="branchOffice"
      :created-at="cashflow.createdAt"
      :payment-method="cashflow.paymentMethodId"
      :description-value="cashflow.description"
      :cashBoxState="cashflow.cashboxUser"
      :flow-type-options="[
        { label: 'Arqueo', value: 'withdrawal' }
      ]"
      @update:modelValue="onCashflowSaved"
    />

    <!-- Image Preview Dialog -->
    <q-dialog
      v-model="showImagePreview"
      :maximized="$q.screen.lt.md"
      :full-width="$q.screen.gt.sm"
      :full-height="$q.screen.gt.sm"
    >
      <q-card class="image-preview-card">
        <q-card-section class="row items-center q-pa-sm bg-dark text-white">
          <div class="text-subtitle1 text-weight-medium">Previsualización de Imagen - Retiro</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" size="sm" />
        </q-card-section>

        <q-card-section class="image-container">
          <div v-if="imageLoading" class="image-placeholder">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-primary q-mt-md">Cargando imagen...</div>
          </div>

          <div v-else-if="imageError" class="image-placeholder">
            <q-icon name="broken_image" size="80px" color="grey-5" />
            <div class="text-grey-8 q-mt-md text-weight-medium">Error al cargar la imagen</div>
            <div class="text-grey-6 q-mt-sm text-caption">{{ imageError }}</div>
          </div>

          <img
            v-else-if="previewImageUrl"
            :src="previewImageUrl"
            class="preview-image"
            @error="handleImageError"
            @load="imageLoading = false"
          />

          <div v-else class="image-placeholder">
            <q-icon name="image_not_supported" size="80px" color="grey-5" />
            <div class="text-grey-8 q-mt-md text-weight-medium">No hay imagen disponible</div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md bg-grey-1">
          <q-btn
            v-if="previewImageUrl && !imageError"
            color="primary"
            icon="download"
            label="Descargar"
            @click="downloadImage"
            unelevated
          />
          <q-btn
            color="grey-7"
            icon="close"
            label="Cerrar"
            v-close-popup
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Help Dialog -->
    <q-dialog v-model="showHelp" maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">📚 Guía de Uso - Comparación de Ventas vs Arqueos</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg" style="max-width: 900px; margin: 0 auto;">
          <div class="q-gutter-lg">
            <!-- What is this -->
            <div>
              <div class="text-h6 text-weight-bold q-mb-sm">🎯 ¿Para qué sirve este reporte?</div>
              <p class="text-body1">
                Este reporte te permite <strong>comparar las ventas del día con los arqueos realizados</strong>.
                Es una herramienta de control para verificar que el dinero retirado coincida con las ventas facturadas.
              </p>
            </div>

            <q-separator />

            <!-- How to use -->
            <div>
              <div class="text-h6 text-weight-bold q-mb-sm">📖 ¿Cómo usar el reporte?</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" icon="filter_alt" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">1. Selecciona el período</q-item-label>
                    <q-item-label caption>
                      Por defecto se muestra el mes actual. Puedes cambiar las fechas o usar los botones rápidos.
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="positive" text-color="white" icon="store" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">2. Filtra por sucursal</q-item-label>
                    <q-item-label caption>
                      Por defecto se muestra tu sucursal actual. Puedes agregar más sucursales si tienes permisos.
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="blue" text-color="white" icon="visibility" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">3. Revisa los totales</q-item-label>
                    <q-item-label caption>
                      En las tarjetas superiores verás: Ventas totales, Arqueos realizados, Diferencia y Días consultados.
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="orange" text-color="white" icon="expand_more" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">4. Expande cada día</q-item-label>
                    <q-item-label caption>
                      Haz clic en cualquier día para ver el detalle de cada arqueo realizado.
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <q-separator />

            <!-- Understanding the data -->
            <div>
              <div class="text-h6 text-weight-bold q-mb-sm">💡 Entendiendo los datos</div>
              <div class="q-gutter-md">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="row items-center q-gutter-sm">
                      <q-icon name="point_of_sale" size="32px" color="positive" />
                      <div>
                        <div class="text-weight-bold">Ventas del Período</div>
                        <div class="text-caption">Total de dinero facturado en las ventas realizadas</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered>
                  <q-card-section>
                    <div class="row items-center q-gutter-sm">
                      <q-icon name="account_balance_wallet" size="32px" color="blue" />
                      <div>
                        <div class="text-weight-bold">Arqueos Realizados</div>
                        <div class="text-caption">Total de dinero retirado según los arqueos de caja</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered>
                  <q-card-section>
                    <div class="row items-center q-gutter-sm">
                      <q-icon name="compare_arrows" size="32px" color="warning" />
                      <div>
                        <div class="text-weight-bold">Diferencia</div>
                        <div class="text-caption">
                          <strong>✅ Si es $0:</strong> Los arqueos coinciden con las ventas<br>
                          <strong>⚠️ Si es positivo:</strong> Se retiró más de lo vendido<br>
                          <strong>❌ Si es negativo:</strong> Falta dinero por arquear
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <q-separator />

            <!-- Tips -->
            <div>
              <div class="text-h6 text-weight-bold q-mb-sm">💪 Consejos</div>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    Revisa este reporte al final de cada día para asegurar que todo cuadre
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    Si hay diferencias, expande el día y verifica cada arqueo individual
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    Usa los filtros de método de pago para revisar efectivo, tarjetas, etc. por separado
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            unelevated
            color="primary"
            label="Entendido"
            icon="check"
            v-close-popup
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import CashflowModal from 'src/components/CashflowModal.vue'

/**
 * Component for displaying and managing daily withdrawal reports
 * @component ReportWithdrawalsPage
 * @description Displays a report of daily withdrawals with filtering, export, and management capabilities
 */

export default {
  name: 'WithdrawalsReport',
  components: {
    CashflowModal
  },

  watch: {
    /**
     * Watcher for showCashflowModal changes
     * @param {boolean} newShow - New value of showCashflowModal
     */
    showCashflowModal (newShow) {
      if (!newShow) {
        this.cashflow = {}
      }
    }
  },

  /**
   * Component setup function
   * @returns {Object} Component's public interface
   */
  setup () {
    const $q = useQuasar()

    /*
     * Controls the loading state for the main data
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false)

    /*
     * Controls the loading state for branch offices data
     * @type {import('vue').Ref<boolean>}
     */
    const loadingBranches = ref(false)

    /*
     * Controls the loading state for payment methods data
     * @type {import('vue').Ref<boolean>}
     */
    const loadingPaymentMethods = ref(false)

    /*
     * Array containing daily withdrawal data with summary information
     * @type {import('vue').Ref<Array<{
     *   day: string,
     *   sum_amount: number,
     *   count: number,
     *   withdrawals: Array<Object>,
     *   cashboxes: Array<Object>
     * }>>}
     */
    const daysData = ref([])

    /*
     * Authentication store instance
     * @type {Object}
     */
    const store = authentication()

    /*
     * List of available branch offices
     * @type {import('vue').Ref<Array<Object>>}
     */
    const branchOffices = ref([])

    /*
     * List of available payment methods
     * @type {import('vue').Ref<Array<Object>>}
     */
    const paymentMethods = ref([])

    /*
     * Start date for the report in YYYY-MM-DD format
     * @type {import('vue').Ref<string>}
     */
    const dateFrom = ref('')

    /*
     * End date for the report in YYYY-MM-DD format
     * @type {import('vue').Ref<string>}
     */
    const dateTo = ref('')

    /*
     * Active filters for the report
     * @type {import('vue').Ref<{
     *   branch_office_ids: Array<number>,
     *   payment_method_ids: Array<number>,
     *   cashbox_user_id: number|null
     * }>}
     */
    const filters = ref({
      branch_office_ids: [],
      payment_method_ids: [],
      cashbox_user_id: null
    })

    /*
     * Current user session data from the authentication store
     * @type {import('vue').ComputedRef<Object>}
     */
    const userSession = computed(() => store.userSession)

    /*
     * Current branch office data from the authentication store
     * @type {import('vue').ComputedRef<Object>}
     */
    const branchOffice = computed(() => store.branchOffice)

    /*
     * Visibility of the cashflow modal
     * @type {import('vue').Ref<boolean>}
     */
    const showCashflowModal = ref(false)

    /*
     * Currently selected date for cashflow operations
     * @type {import('vue').Ref<string|null>}
     */
    const selectedDate = ref(null)

    /*
     * Set of expanded row dates
     * @type {import('vue').Ref<Set<string>>}
     */
    /*
     * Tracks which date rows are currently expanded
     * @type {import('vue').Ref<Set<string>>}
     */
    const expandedRows = ref(new Set())

    /*
     * Pagination state for each day's withdrawal list
     * @type {import('vue').Ref<{[key: string]: {currentPage: number}}>}
     */
    const dayPagination = ref({})

    /*
     * Number of items to display per page in the paginated lists
     * @type {number}
     */
    const itemsPerPage = 50

    /*
     * Aggregated totals for the report
     * @type {import('vue').Ref<{
     *   paid_sales?: number,
     *   sum_amount?: number,
     *   difference_report?: string
     * }>}
     */
    const totalsAmount = ref({})

    /*
     * Controls visibility of the help dialog
     * @type {import('vue').Ref<boolean>}
     */
    const showHelp = ref(false)

    /*
     * Controls visibility of the image preview modal
     * @type {import('vue').Ref<boolean>}
     */
    const showImagePreview = ref(false)

    /*
     * URL of the image being previewed
     * @type {import('vue').Ref<string|null>}
     */
    const previewImageUrl = ref(null)

    /*
     * Loading state for the image preview
     * @type {import('vue').Ref<boolean>}
     */
    const imageLoading = ref(false)

    /*
     * Error message for image loading failures
     * @type {import('vue').Ref<string|null>}
     */
    const imageError = ref(null)

    /*
     * Currently selected withdrawal for preview
     * @type {import('vue').Ref<Object|null>}
     */
    const currentWithdrawal = ref(null)
    const cashflow = ref({})
    const savingWithdrawalId = ref(null)
    const showFilters = ref(true)

    /**
     * Computed property that calculates the total amount of all withdrawals
     * @type {import('vue').ComputedRef<number>}
     */
    const totalAmount = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseFloat(day.sum_amount || 0), 0)
    })

    /**
     * Computed property that calculates the total number of withdrawals
     * @type {import('vue').ComputedRef<number>}
     */
    const totalWithdrawals = computed(() => {
      return daysData.value.reduce((sum, day) => sum + parseInt(day.count || 0), 0)
    })

    /**
     * Computed property that checks if there is any data to display
     * @type {import('vue').ComputedRef<boolean>}
     */
    const hasData = computed(() => {
      return daysData.value.length > 0
    })

    const dayColumns = [
      {
        name: 'day',
        label: 'Fecha',
        field: 'day',
        align: 'left',
        sortable: true
      },
      {
        name: 'paid_sales',
        label: 'Ventas Pagadas',
        field: 'paid_sales',
        align: 'right',
        format: val => formatCurrency(val),
        sortable: true
      },
      {
        name: 'sum_amount',
        label: 'Total (ARS)',
        field: 'sum_amount',
        align: 'right',
        sortable: true
      },
      {
        name: 'difference',
        label: 'Diferencia',
        field: 'difference',
        align: 'right',
        format: val => formatCurrency(val),
        sortable: true
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'center'
      }
    ]

    const isMounted = ref(false)

    /**
     * Sets default filters and dates on component mount
     */
    const initializeDefaults = () => {
      // Set current month as default date range
      setCurrentMonth()

      // Set current branch office as default filter
      if (branchOffice.value && branchOffice.value.id) {
        filters.value.branch_office_ids = [branchOffice.value]
      }
    }

    onMounted(() => {
      isMounted.value = true
      initializeDefaults()
      loadBranchOffices()
      loadPaymentMethods()
      loadData()
    })

    onUnmounted(() => {
      isMounted.value = false
    })

    /**
     * Loads the list of branch offices from the API
     * @async
     * @returns {Promise<void>}
     * @description Fetches branch offices and updates the component state
     */
    const loadBranchOffices = async () => {
      loadingBranches.value = true
      try {
        const response = await api.get('branch-offices')
        branchOffices.value = response.data || []
      } catch (error) {
        console.error('Error loading branch offices:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando sucursales'
        })
      } finally {
        loadingBranches.value = false
      }
    }

    /**
     * Loads the list of available payment methods from the API
     * @async
     * @returns {Promise<void>}
     * @description Fetches payment methods and updates the component state
     */
    const loadPaymentMethods = async () => {
      loadingPaymentMethods.value = true
      try {
        const response = await api.get('payment-methods')
        paymentMethods.value = response.data || []
      } catch (error) {
        console.error('Error loading payment methods:', error)
        $q.notify({
          type: 'negative',
          message: 'Error cargando métodos de pago'
        })
      } finally {
        loadingPaymentMethods.value = false
      }
    }

    /**
     * Loads withdrawal data based on current filters and date range
     * @async
     * @param {boolean} [showLoading=true] - Whether to show the loading indicator
     * @returns {Promise<void>}
     * @description Fetches withdrawal data from the API and updates the component state
     */
    const loadData = async (showLoading = true) => {
      if (!isMounted.value) return
      if (showLoading) {
        loading.value = true
      }

      try {
        const params = {
          type_cashflow: 'withdrawal',
          date_from: dateFrom.value,
          date_to: dateTo.value
        }

        // Add filters if they have values
        if (filters.value.branch_office_ids?.length) {
          params.branch_office_ids = filters.value.branch_office_ids.map(data => data?.id)
        }
        if (filters.value.payment_method_ids?.length) {
          params.payment_method_ids = filters.value.payment_method_ids.map(data => data?.id)
        }
        if (filters.value.cashbox_user_id) {
          params.cashbox_user_id = filters.value.cashbox_user_id
        }

        const response = await api.get('/reports/withdrawals-per-day', { params })
        if (isMounted.value) {
          daysData.value = response.data.days || []
          totalsAmount.value = response.data.meta
        }
      } catch (error) {
        console.error('Error loading withdrawals:', error)
        if (isMounted.value) {
          $q.notify({
            type: 'negative',
            message: 'Error cargando datos de retiros',
            caption: error.response?.data?.message || error.message
          })
          daysData.value = []
        }
      } finally {
        if (isMounted.value && showLoading) {
          loading.value = false
        }
      }
    }

    /**
     * Timer ID for debouncing API calls
     * @type {number|null}
     */
    let debounceTimer = null

    /**
     * Debounced version of loadData to prevent excessive API calls
     * @returns {void}
     * @description Delays the execution of loadData by 300ms to prevent rapid successive calls
     */
    const debouncedLoadData = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(loadData, 300)
    }

    /**
     * Sets the date range to the current month
     */
    const setCurrentMonth = () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      dateFrom.value = formatDateForInput(firstDay)
      dateTo.value = formatDateForInput(lastDay)
      loadData()
    }

    /**
     * Sets the date range to the previous month
     */
    const setPreviousMonth = () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)

      dateFrom.value = formatDateForInput(firstDay)
      dateTo.value = formatDateForInput(lastDay)
      loadData()
    }

    /**
     * Sets the date range to today
     */
    const setToday = () => {
      const today = new Date()
      dateFrom.value = formatDateForInput(today)
      dateTo.value = formatDateForInput(today)
      loadData()
    }

    /**
     * Computed property to check if current month is selected
     */
    const isCurrentMonth = computed(() => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      return dateFrom.value === formatDateForInput(firstDay) &&
             dateTo.value === formatDateForInput(lastDay)
    })

    /**
     * Computed property to check if previous month is selected
     */
    const isPreviousMonth = computed(() => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)

      return dateFrom.value === formatDateForInput(firstDay) &&
             dateTo.value === formatDateForInput(lastDay)
    })

    /**
     * Computed property to check if today is selected
     */
    const isToday = computed(() => {
      const today = new Date()
      const todayStr = formatDateForInput(today)

      return dateFrom.value === todayStr && dateTo.value === todayStr
    })

    /**
     * Gets the status information for the difference card
     */
    const getDifferenceStatus = () => {
      const diff = totalsAmount.value.difference_report || 0

      if (Math.abs(diff) < 0.01) {
        return {
          icon: '✅',
          iconName: 'check_circle',
          label: '¡Perfecto! Todo cuadra',
          color: '#21BA45',
          colorClass: 'positive'
        }
      } else if (diff > 0) {
        return {
          icon: '⚠️',
          iconName: 'warning',
          label: 'Se retiró más de lo vendido',
          color: '#F2C037',
          colorClass: 'warning'
        }
      } else {
        return {
          icon: '❌',
          iconName: 'error',
          label: 'Falta dinero por arquear',
          color: '#C10015',
          colorClass: 'negative'
        }
      }
    }

    /**
     * Gets the status class for a day card
     */
    const getDayStatusClass = (day) => {
      const diff = Math.abs(day.difference_report || 0)
      if (diff < 0.01) return 'bg-green-1'
      if (diff < 1000) return 'bg-orange-1'
      return 'bg-red-1'
    }

    /**
     * Gets the status icon for a day
     */
    const getDayStatusIcon = (day) => {
      const diff = Math.abs(day.difference_report || 0)
      if (diff < 0.01) return 'check_circle'
      if (diff < 1000) return 'warning'
      return 'error'
    }

    /**
     * Gets the status color for a day
     */
    const getDayStatusColor = (day) => {
      const diff = Math.abs(day.difference_report || 0)
      if (diff < 0.01) return 'positive'
      if (diff < 1000) return 'warning'
      return 'negative'
    }

    /**
     * Gets the status text for a day
     */
    const getDayStatusText = (day) => {
      const diff = Math.abs(day.difference_report || 0)
      if (diff < 0.01) return 'Todo coincide perfectamente'
      if (diff < 1000) return `Diferencia menor: ${formatCurrency(diff)}`
      return `Diferencia importante: ${formatCurrency(diff)}`
    }

    /**
     * Gets the CSS class for difference display
     */
    const getDifferenceClass = (difference) => {
      const diff = Math.abs(difference || 0)
      if (diff < 0.01) return 'text-positive'
      if (diff < 1000) return 'text-warning'
      return 'text-negative'
    }

    /**
     * Changes the current date range by the specified number of days
     * @param {number} days - Number of days to adjust the date range by
     * @returns {void}
     * @description Updates both dateFrom and dateTo to the same new date
     */
    const changeDate = (days) => {
      const currentDate = new Date(dateFrom.value)
      currentDate.setDate(currentDate.getDate() + days)
      const newDate = formatDateForInput(currentDate)
      dateFrom.value = newDate
      dateTo.value = newDate
      loadData()
    }

    /**
     * Exports the withdrawal data to a CSV file
     * @returns {void}
     * @description Generates and downloads a CSV file containing withdrawal data
     */
    const exportCSV = () => {
      if (!hasData.value) return

      const headers = ['Fecha', 'Hora', 'Descripción', 'Monto', 'Método de Pago', 'Caja', 'Sucursal', 'Usuario']
      const rows = []

      daysData.value.forEach(day => {
        day.withdrawals.forEach(w => {
          rows.push([
            day.day,
            w.time,
            `"${w.description}"`,
            w.amount,
            `"${w.payment_method_name}"`,
            w.cashbox_user_id,
            w.branch_office_id,
            w.user_created_id
          ].join(','))
        })
      })

      const csvContent = [headers.join(','), ...rows].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `retiros-${dateFrom.value}-${dateTo.value}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      $q.notify({
        type: 'positive',
        message: 'CSV exportado exitosamente'
      })
    }

    /**
     * Updates a withdrawal with a new calculated amount
     * @async
     * @param {Object} withdrawal - The withdrawal object to update
     * @returns {Promise<void>}
     * @description Updates the withdrawal amount and refreshes the UI
     */
    const updateWithdrawal = async (withdrawal) => {
      try {
        // Get the new amount from withdrawal.actual_amount
        const newAmount = withdrawal.actual_amount

        if (!newAmount || newAmount <= 0) {
          $q.notify({
            type: 'warning',
            message: 'Debe ingresar un monto adicional válido'
          })
          return
        }

        // Set loading state for this specific withdrawal
        savingWithdrawalId.value = withdrawal.id

        const payload = {
          id: withdrawal.id,
          description: withdrawal.description,
          amount: withdrawal.amount,
          branch_office_id: branchOffice.value?.id,
          type_cashflow: 'withdrawal',
          cashbox_user_id: withdrawal.cashbox_user_id,
          payment_method_id: withdrawal.payment_method_id,
          created_at: withdrawal.created_at, // Mantener fecha original
          actual_amount: newAmount
        }

        await api.put(`cashflow/${withdrawal.id}`, payload)

        // Update local data without reloading to maintain expanded state
        let found = false
        for (const day of daysData.value) {
          if (day.cashboxes && Array.isArray(day.cashboxes)) {
            for (const cashbox of day.cashboxes) {
              if (cashbox.withdrawals && Array.isArray(cashbox.withdrawals)) {
                const withdrawalIndex = cashbox.withdrawals.findIndex(w => w.id === withdrawal.id)
                if (withdrawalIndex >= 0) {
                  // Update actual_amount to preserve original amount for difference calculation
                  cashbox.withdrawals[withdrawalIndex].actual_amount = newAmount
                  found = true
                  break
                }
              }
            }
          }
          if (found) break
        }

        if (!found) {
          // Fallback: reload data if withdrawal not found
          await loadData(false)
        } else {
          // Reload data silently to update totals
          await loadData(false)
        }

        // Show success notification
        $q.notify({
          type: 'positive',
          message: 'Retiro actualizado exitosamente',
          icon: 'check_circle',
          position: 'top-right',
          timeout: 2000
        })
      } catch (error) {
        console.error('Error updating withdrawal:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al actualizar el retiro',
          caption: error.response?.data?.message || error.message
        })
      } finally {
        // Clear loading state
        savingWithdrawalId.value = null
      }
    }

    /**
     * Gets a paginated subset of withdrawals for a specific day
     * @param {Array} dayWithdrawals - Array of withdrawals for the day
     * @param {string} day - The day identifier
     * @returns {Array} - Paginated array of withdrawals
     */
    const getPaginatedWithdrawals = (dayWithdrawals, day) => {
      if (!dayPagination.value[day]) {
        dayPagination.value[day] = { currentPage: 1 }
      }

      const startIndex = (dayPagination.value[day].currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return dayWithdrawals.slice(startIndex, endIndex)
    }

    /**
     * Calculates the total number of pages for a day's withdrawals
     * @param {Array} dayWithdrawals - Array of withdrawals for the day
     * @returns {number} - Total number of pages
     */
    const getTotalPages = (dayWithdrawals) => {
      return Math.ceil(dayWithdrawals.length / itemsPerPage)
    }

    /**
     * Changes the current page for a specific day's withdrawals
     * @param {string} day - The day identifier
     * @param {string} direction - Direction to change page ('next' or 'prev')
     * @returns {void}
     */
    const changePage = (day, direction) => {
      if (!dayPagination.value[day]) {
        dayPagination.value[day] = { currentPage: 1 }
      }

      const dayData = daysData.value.find(d => d.day === day)
      if (!dayData) return

      const totalPages = getTotalPages(dayData.withdrawals)
      const currentPage = dayPagination.value[day].currentPage

      if (direction === 'next' && currentPage < totalPages) {
        dayPagination.value[day].currentPage++
      } else if (direction === 'prev' && currentPage > 1) {
        dayPagination.value[day].currentPage--
      }
    }

    /**
     * Toggles the expanded/collapsed state for a specific day
     * @param {string} day - The day identifier to toggle
     * @returns {void}
     */
    const toggleExpanded = (day) => {
      if (expandedRows.value.has(day)) {
        expandedRows.value.delete(day)
      } else {
        expandedRows.value.add(day)
        // Initialize pagination for this day if not exists
        if (!dayPagination.value[day]) {
          dayPagination.value[day] = { currentPage: 1 }
        }
      }
    }

    /**
     * Opens the cashflow modal for a specific date
     * @param {Object} row - The row data containing date and cashbox information
     * @returns {void}
     */
    const openCashflowModal = (row) => {
      selectedDate.value = row.day
      showCashflowModal.value = true
      cashflow.value = {
        cashboxUser: {
          id: row.cashbox_user_id
        },
        paymentMethodId: row.by_payment_method[0]?.payment_method_id || paymentMethods.value[0]?.id,
        createdAt: row.closed_at,
        branchOffice: branchOffice.value,
        description: 'Arqueo'
      }
      // Ensure the row is expanded when adding a new record
      expandedRows.value.add(row.day)
    }

    /**
     * Handles the cashflow saved event
     * @param {Object} newCashflow - The newly saved cashflow data
     * @returns {void}
     * @description Updates the UI with the new cashflow data
     */
    const onCashflowSaved = async (newCashflow) => {
      showCashflowModal.value = false
      selectedDate.value = null
      cashflow.value = {}

      // Reload data silently to ensure all information is up to date
      await loadData(false)

      $q.notify({
        type: 'positive',
        message: 'Retiro guardado exitosamente'
      })
    }

    /**
     * Opens the image preview for a withdrawal
     * @param {Object} withdrawal - The withdrawal object containing image data
     * @returns {void}
     */
    const openFileWithdrawal = (withdrawal) => {
      try {
        currentWithdrawal.value = withdrawal
        imageLoading.value = true
        imageError.value = null
        previewImageUrl.value = null
        showImagePreview.value = true

        // Check if withdrawal has images
        if (withdrawal.images && withdrawal.images.length > 0) {
          // Use the first image URL directly from the API response
          const firstImage = withdrawal.images[0]
          if (firstImage.url) {
            previewImageUrl.value = firstImage.url
            imageLoading.value = false
          } else {
            throw new Error('URL de imagen no disponible')
          }
        } else {
          throw new Error('No hay imágenes disponibles para este retiro')
        }
      } catch (error) {
        console.error('Error loading withdrawal image:', error)
        imageError.value = error.message || 'Error al cargar la imagen'
        previewImageUrl.value = null
        imageLoading.value = false
      }
    }

    /**
     * Handles image loading errors
     * @returns {void}
     */
    const handleImageError = () => {
      imageError.value = 'Error al cargar la imagen'
      imageLoading.value = false
    }

    /**
     * Initiates download of the currently viewed image
     * @returns {void}
     */
    const downloadImage = () => {
      if (previewImageUrl.value && currentWithdrawal.value) {
        const link = document.createElement('a')
        link.href = previewImageUrl.value

        // Create a descriptive filename
        const date = currentWithdrawal.value.created_at
          ? currentWithdrawal.value.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0]
        const description = currentWithdrawal.value.description?.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '') || 'retiro'
        const extension = previewImageUrl.value.includes('.jpg') ? '.jpg'
          : previewImageUrl.value.includes('.png') ? '.png'
            : previewImageUrl.value.includes('.jpeg') ? '.jpeg' : '.jpg'

        link.download = `${description}-${currentWithdrawal.value.id}-${date}${extension}`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        $q.notify({
          type: 'positive',
          message: 'Descarga iniciada',
          caption: 'La imagen se está descargando...'
        })
      }
    }

    /**
     * Flattens withdrawals from all cashboxes for a given day
     * @param {Object} dayData - The day data object containing cashboxes
     * @returns {Array} - Flattened array of all withdrawals for the day
     */
    const getAllWithdrawalsForDay = (dayData) => {
      return dayData.cashboxes.flatMap(cashbox => cashbox.withdrawals)
    }

    /**
     * Generates and opens a print-friendly version of the withdrawal report
     * @returns {void}
     * @description Creates a new window with a print-optimized view of the report
     */
    const printReport = () => {
      const printContent = `
        <html>
          <head>
            <title>Reporte de Retiros - ${dateFrom.value} a ${dateTo.value}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1976d2; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { font-size: 18px; font-weight: bold; margin: 20px 0; }
              .day-header { background-color: #e3f2fd; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte de Retiros por Día</h1>
            <p><strong>Período:</strong> ${formatDate(dateFrom.value)} - ${formatDate(dateTo.value)}</p>
            <div class="total">Total General: ${formatCurrency(totalAmount.value)}</div>
            <div class="total">Total Retiros: ${totalWithdrawals.value}</div>

            ${daysData.value.map(day => `
              <h3>Fecha: ${formatDate(day.day)} - Total: ${formatCurrency(day.sum_amount)} (${day.count} retiros)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Método de Pago</th>
                    <th>Caja</th>
                    <th>Sucursal</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  ${getAllWithdrawalsForDay(day).map(w => `
                    <tr>
                      <td>${w.time}</td>
                      <td>${w.description}</td>
                      <td>${formatCurrency(w.amount)}</td>
                      <td>${w.payment_method_name}</td>
                      <td>${w.cashbox_user_id}</td>
                      <td>${w.branch_office_id}</td>
                      <td>${w.user_created_id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `).join('')}
          </body>
        </html>
      `

      const printWindow = window.open('', '_blank')
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }

    // Helper functions
    /**
     * Formats a number as currency in Argentine Peso (ARS)
     * @param {number} amount - Number to format
     * @returns {string} - Formatted currency string
     */
    function formatCurrency (amount) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount || 0)
    }

    /**
     * Formats a number as compact currency (e.g., $1.2M, $135K)
     * @param {number} amount - Number to format
     * @returns {string} - Formatted compact currency string
     */
    function formatCurrencyCompact (amount) {
      const num = amount || 0
      if (num >= 1000000) {
        return `$ ${(num / 1000000).toFixed(2)}M`
      } else if (num >= 1000) {
        return `$ ${(num / 1000).toFixed(1)}K`
      }
      return `$ ${num.toFixed(2)}`
    }

    /**
     * Formats a date string to a localized date format
     * @param {string} dateString - Date string to format
     * @returns {string} - Formatted date string in 'DD/MM/YYYY' format
     */
    function formatDate (dateString) {
      if (!dateString) return ''
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    }

    /**
     * Formats a date string to a localized short date format
     * @param {string} dateString - Date string to format
     * @returns {string} - Formatted date string in 'DD/MM/YYYY' format
     */
    /**
     * Formats a date string to a short localized format
     * @param {string} dateString - The date string to format
     * @returns {string} - Formatted date string
     */
    function formatDateShort (dateString) {
      // Agregar 'T00:00:00' para evitar problemas de zona horaria
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('es-AR')
    }

    /**
     * Formats a date object to YYYY-MM-DD string format
     * @param {Date|string} date - The date to format
     * @returns {string} - Formatted date string
     */
    function formatDateForInput (date) {
      return date.toISOString().split('T')[0]
    }

    /**
     * Calculates the difference between actual and original amount
     * @param {number|string} originalAmount - The original amount
     * @param {number|string} actualAmount - The actual/current amount
     * @returns {number} - The difference between amounts
     */
    function calculateTotal (originalAmount, actualAmount) {
      const newAmount = actualAmount
      if (newAmount && newAmount > 0) {
        return parseFloat(newAmount) - parseFloat(originalAmount)
      }
      return 0
    }

    /**
     * Determines the color class based on amount difference
     * @param {number|string} originalAmount - The original amount
     * @param {number|string} actualAmount - The actual/current amount
     * @returns {string} - CSS class for the difference display
     */
    function getDifferenceColor (originalAmount, actualAmount) {
      const newAmount = actualAmount
      if (!newAmount || newAmount <= 0) return 'text-negative'

      const original = parseFloat(originalAmount)
      const replacement = parseFloat(newAmount)
      const difference = replacement - original

      if (difference < 0) return 'text-negative' // Rojo
      if (difference > 0) return 'text-positive' // Verde
      return 'text-info' // Azul
    }

    return {
      // State
      loading,
      loadingBranches,
      loadingPaymentMethods,
      daysData,
      branchOffices,
      paymentMethods,
      dateFrom,
      dateTo,
      cashflow,
      filters,
      totalsAmount,
      showHelp,

      // Computed
      totalAmount,
      totalWithdrawals,
      hasData,
      dayColumns,
      isCurrentMonth,
      isPreviousMonth,
      isToday,

      // Date Methods
      setCurrentMonth,
      setPreviousMonth,
      setToday,
      changeDate,

      // Status Methods
      getDifferenceStatus,
      getDayStatusClass,
      getDayStatusIcon,
      getDayStatusColor,
      getDayStatusText,
      getDifferenceClass,

      // Data Methods
      loadData,
      debouncedLoadData,
      exportCSV,
      printReport,

      // Formatting
      formatCurrency,
      formatCurrencyCompact,
      formatDate,
      formatDateShort,
      calculateTotal,
      getDifferenceColor,

      // Modal & UI
      showCashflowModal,
      selectedDate,
      expandedRows,
      dayPagination,
      itemsPerPage,
      getPaginatedWithdrawals,
      getTotalPages,
      changePage,
      toggleExpanded,
      // User & Branch
      userSession,
      branchOffice,

      // Withdrawal Operations
      updateWithdrawal,
      openCashflowModal,
      onCashflowSaved,
      savingWithdrawalId,
      showFilters,

      // Image preview
      showImagePreview,
      previewImageUrl,
      imageLoading,
      imageError,
      currentWithdrawal,
      openFileWithdrawal,
      handleImageError,
      downloadImage
    }
  }
}
</script>

<style scoped>
/* Modern Page Layout */
.modern-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  min-height: 100vh;
  padding: 24px;
}

/* Header Card with Gradient */
.header-card {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 1;
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 15px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: float 3s ease-in-out infinite;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.help-button {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.help-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Filters Card - Compact Version */
.filters-card-compact {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.filters-header-compact {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0e0e0;
}

.filters-title-compact {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.filters-content-compact {
  padding: 16px;
}

/* Date Filter Buttons */
.date-btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.date-filter-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 110px;
}

.date-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* Compact Date Inputs */
.date-input-compact {
  width: 140px;
  border-radius: 8px;
}

.date-input-compact :deep(.q-field__control) {
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  transition: all 0.3s ease;
}

.date-input-compact :deep(.q-field__control):hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.date-input-compact :deep(.q-field__native) {
  font-size: 13px;
  font-weight: 500;
  color: #2c3e50;
}

/* Compact Filter Selects */
.filter-select-compact :deep(.q-field__control) {
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  transition: all 0.3s ease;
}

.filter-select-compact :deep(.q-field__control):hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.filter-select-compact :deep(.q-field__native) {
  font-size: 13px;
  font-weight: 500;
  color: #2c3e50;
}

.filter-select-compact :deep(.q-chip) {
  font-size: 12px;
  border-radius: 6px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

/* Modern Date Pills */
.date-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.date-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.date-pill:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.date-pill.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.pill-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: white;
  border-radius: 2px;
  animation: pulse 2s ease-in-out infinite;
}

/* Modern Select */
.modern-select {
  transition: all 0.3s ease;
}

.modern-select:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* Stat Cards - Compact Version */
.stat-card-compact {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-card-compact:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  overflow: hidden;
  opacity: 0.05;
}

.stat-card-circle {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: currentColor;
}

.stat-card-success {
  border-left: 4px solid #10b981;
  color: #10b981;
}

.stat-card-info {
  border-left: 4px solid #3b82f6;
  color: #3b82f6;
}

.stat-card-warning {
  border-left: 4px solid #f59e0b;
  color: #f59e0b;
}

.stat-card-negative {
  border-left: 4px solid #ef4444;
  color: #ef4444;
}

.stat-card-positive {
  border-left: 4px solid #10b981;
  color: #10b981;
}

.stat-card-purple {
  border-left: 4px solid #8b5cf6;
  color: #8b5cf6;
}

.stat-card-content-compact {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.stat-icon-wrapper-compact {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-icon-wrapper-compact.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
}

.stat-icon-wrapper-compact.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
}

.stat-icon-wrapper-compact.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.25);
}

.stat-icon-wrapper-compact.negative {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
}

.stat-icon-wrapper-compact.positive {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
}

.stat-icon-wrapper-compact.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.25);
}

.stat-card-compact:hover .stat-icon-wrapper-compact {
  transform: scale(1.08) rotate(3deg);
}

.stat-info-compact {
  flex: 1;
}

.stat-label-compact {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.stat-value-compact {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 3px;
  font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.2;
}

.stat-description-compact {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.stat-badge-compact {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  z-index: 2;
}

.stat-card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover .stat-card-shine {
  left: 100%;
}

.stat-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: bounce 2s ease-in-out infinite;
}

/* Animations */
@keyframes animate-slide-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: animate-slide-down 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes animate-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: animate-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes animate-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: animate-scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Withdrawals List - Compact */
.withdrawals-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Withdrawal Row - Compact Design */
.withdrawal-row {
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 12px;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.2s ease;
}

.withdrawal-row:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

/* Withdrawal Info - Compact */
.withdrawal-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.withdrawal-time-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 11px;
  width: fit-content;
}

.withdrawal-payment-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
}

/* Withdrawal Amounts - Compact */
.withdrawal-amounts-compact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amount-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.amount-label-compact {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value-compact {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.expected-compact {
  padding: 6px 10px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.actual-compact {
  padding: 6px 10px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 8px;
  border: 1px solid #10b981;
}

.amount-arrow-compact {
  flex-shrink: 0;
}

/* Amount Input - Compact */
.amount-input-compact {
  margin-top: 2px;
}

.amount-input-compact :deep(.q-field__control) {
  background: white;
  border: 1px solid #10b981;
  border-radius: 6px;
  min-height: 32px;
}

.amount-input-compact :deep(.q-field__native) {
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  padding: 4px 8px;
}

.amount-input-compact :deep(.q-field__control):focus-within {
  border-color: #059669;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

/* Withdrawal Actions - Compact */
.withdrawal-actions-compact {
  display: flex;
  gap: 6px;
  align-items: center;
}

.save-btn-compact {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.save-btn-compact:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
}

/* Responsive Withdrawals - Compact */
@media (max-width: 768px) {
  .withdrawal-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .withdrawal-amounts-compact {
    flex-direction: column;
    gap: 8px;
  }

  .amount-arrow-compact {
    transform: rotate(90deg);
  }

  .withdrawal-actions-compact {
    justify-content: flex-end;
  }
}

/* Day card hover effect */
.cursor-pointer {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cursor-pointer:hover {
  background-color: rgba(102, 126, 234, 0.03);
}

/* Status background colors */
.bg-green-1 {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.bg-orange-1 {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.bg-red-1 {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

/* Modern Inputs */
.modern-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid #e0e0e0;
  background: white;
}

.modern-input :deep(.q-field__control):hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.modern-input :deep(.q-field__control):focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.modern-input :deep(.q-field__label) {
  font-weight: 500;
  color: #6b7280;
}

.modern-input :deep(.q-field__native) {
  font-weight: 500;
  color: #1f2937;
}

/* Amount Input Special Style */
.amount-input :deep(.q-field__control) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #10b981;
}

.amount-input :deep(.q-field__control):hover {
  border-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.amount-input :deep(.q-field__native) {
  font-weight: 600;
  color: #059669;
  font-size: 15px;
}

/* Modern Select */
.modern-select :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid #e0e0e0;
  background: white;
}

.modern-select :deep(.q-field__control):hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.modern-select :deep(.q-field__control):focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.modern-select :deep(.q-chip) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  border-radius: 8px;
}

/* Modern Buttons */
.modern-btn {
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: none;
  padding: 8px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modern-btn:active {
  transform: translateY(0);
}

/* Save Button Special Style */
.save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn:hover {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px) scale(1.02);
}

/* Modern Date Picker */
.modern-date-picker :deep(.q-date__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modern-date-picker :deep(.q-date__view) {
  padding: 16px;
}

.modern-date-picker :deep(.q-btn) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modern-date-picker :deep(.q-btn:hover) {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .modern-page {
    padding: 16px;
  }

  .header-content {
    padding: 24px;
  }

  .header-title {
    font-size: 22px;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .date-pills {
    flex-direction: column;
  }

  .date-pill {
    width: 100%;
    justify-content: center;
  }

  .amount-input {
    width: 100% !important;
  }

  .modern-input {
    width: 100% !important;
  }
}

/* Print styles */
@media print {
  .q-toolbar,
  .q-btn,
  .filters-card,
  .help-button {
    display: none !important;
  }

  .modern-page {
    background: white;
  }
}
</style>
