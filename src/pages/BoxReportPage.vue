<template>
  <q-page padding>
    <!-- Header with Branch and Filter -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold text-primary">
        📊 Reporte Diario - {{ reportTitle }}
      </div>
      <div class="column">
        <div>
          <q-btn
            icon="tune"
            label="Filtros"
            color="primary"
            rounded
            @click="dialogFilter = true"
            class="text-weight-bold"
          />
        </div>
      </div>
    </div>

    <!-- Quick Date Buttons -->
    <div class="row q-mb-lg q-mt-lg full-width justify-between items-center">
      <div class="row q-gutter-sm">
        <q-btn
          :color="panel === 'day' && isToday ? 'primary' : 'grey-5'"
          :text-color="panel === 'day' && isToday ? 'white' : 'grey-8'"
          label="Hoy"
          rounded
          @click="selectQuickDate('today')"
        />
        <q-btn
          :color="panel === 'day' && isYesterday ? 'primary' : 'grey-5'"
          :text-color="panel === 'day' && isYesterday ? 'white' : 'grey-8'"
          label="Ayer"
          rounded
          @click="selectQuickDate('yesterday')"
        />
        <q-btn
          :color="panel === 'between' ? 'primary' : 'grey-5'"
          :text-color="panel === 'between' ? 'white' : 'grey-8'"
          label="Este mes"
          rounded
          @click="selectQuickDate('month')"
        />
      </div>
      <q-chip v-if="from && to" color="secondary" text-color="white">
        <div class="flex q-gutter-x-md justify-between items-center">
          <q-icon name="event" size="sm"/>
          <span>
            {{ formatDate(`${from} 00:00:00`, 'DD/MM/YYYY') }} - {{ formatDate(`${to} 00:00:00`, 'DD/MM/YYYY') }}
          </span>
          <q-icon name="filter_alt_off" size="sm" @click="clearFilter" class="cursor-pointer"/>
        </div>
      </q-chip>
    </div>

    <!-- Main Reports Grid -->
    <div class="row q-col-gutter-md">
      <!-- Compact Summary Footer -->
       <div class="col-12" v-if="validate">
         <q-expansion-item
           class="summary-expansion shadow-6"
           :default-opened="expandedCards.summary"
           @show="expandedCards.summary = true"
           @hide="expandedCards.summary = false"
           header-class="bg-grey-8 text-white expansion-header-compact"
           expand-icon-class="text-white"
         >
           <template v-slot:header>
             <div class="row items-center full-width">
               <q-icon name="assessment" size="md" class="q-mr-sm"/>
               <div class="col text-center">
                 <div class="text-h5 text-weight-bold" :class="getProfitColor(categoryTotalsTotals.category_total)">
                   {{ formatNumber(categoryTotalsTotals.category_total) }}
                 </div>
                 <!-- <div class="text-h5 text-weight-bold" :class="getProfitColor(getTotalProfit())">
                   {{ formatNumber(getTotalProfit()) }}
                 </div> -->
                 <div class="text-caption">Venta Total del Período</div>
               </div>
               <div class="col-auto text-right">
                 <div class="text-caption">Costos: {{ formatNumberCompact(categoryTotalsTotals.cost_total || 0) }}</div>
                 <div class="text-caption">Ganancias: {{ formatNumberCompact(getTotalProfit() || 0) }}</div>
                 <div class="text-caption">Flujo: {{ formatNumberCompact(cashflowTotals.cashflow_totals || 0) }}</div>
               </div>
             </div>
           </template>

           <q-card flat>
             <q-card-section class="dense-content" style="max-height: 250px; overflow-y: auto; padding: 12px;">
               <!-- Compact Summary Cards -->
               <div class="row q-col-gutter-xs q-mb-sm">
                 <div class="col-6 col-md-3">
                   <div class="text-center q-pa-sm bg-blue-1 rounded-borders">
                     <q-icon name="shopping_cart" color="blue-6" size="sm"/>
                     <div class="text-h6 text-weight-bold text-blue-8">
                       {{ formatNumberCompact(categoryTotalsTotals.category_total || 0) }}
                     </div>
                     <div class="text-caption text-blue-6">Ventas</div>
                   </div>
                 </div>

                 <div class="col-6 col-md-3">
                   <div class="text-center q-pa-sm bg-red-1 rounded-borders">
                     <q-icon name="receipt_long" color="red-6" size="sm"/>
                     <div class="text-h6 text-weight-bold text-red-8">
                       {{ formatNumberCompact(categoryTotalsTotals.cost_total || 0) }}
                     </div>
                     <div class="text-caption text-red-6">Costos</div>
                   </div>
                 </div>

                 <div class="col-6 col-md-3">
                   <div class="text-center q-pa-sm bg-purple-1 rounded-borders">
                     <q-icon name="account_balance_wallet" color="purple-6" size="sm"/>
                     <div class="text-h6 text-weight-bold text-purple-8">
                       {{ formatNumberCompact(cashflowTotals.cashflow_totals || 0) }}
                     </div>
                     <div class="text-caption text-purple-6">Flujo</div>
                   </div>
                 </div>

                 <div class="col-6 col-md-3">
                   <div class="text-center q-pa-sm" :class="getProfitBgColor(getTotalProfit() + cashflowTotals.cashflow_totals || 0)">
                     <q-icon name="trending_up" :color="getProfitIconColor(getTotalProfit() + cashflowTotals.cashflow_totals || 0)" size="sm"/>
                     <div class="text-h6 text-weight-bold" :class="getProfitColor(getTotalProfit() + cashflowTotals.cashflow_totals || 0)">
                       {{ formatNumberCompact(getTotalProfit() + cashflowTotals.cashflow_totals || 0) }}
                     </div>
                     <div class="text-caption" :class="getProfitColor(getTotalProfit() + cashflowTotals.cashflow_totals || 0)">Total</div>
                   </div>
                 </div>
               </div>
             </q-card-section>
           </q-card>
         </q-expansion-item>
       </div>
      <!-- Enhanced Payment Methods Report -->
      <div class="col-12 col-md-6">
        <q-expansion-item
          class="report-expansion shadow-4"
          :default-opened="expandedCards.paymentMethods"
          @show="expandedCards.paymentMethods = true"
          @hide="expandedCards.paymentMethods = false"
          header-class="bg-green-6 text-white expansion-header-compact"
          expand-icon-class="text-white"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-icon name="payments" size="sm" class="q-mr-sm"/>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">💳 Métodos de Pago</div>
              </div>
              <div class="col-auto flex justify-center items-center q-gutter-x-md">
                <div class="text-body1 text-bold" @click.stop="paymentDetailsModal">
                  Total: {{ formatNumber(paymentMethodTotals.payment_total || 0) }}
                  <q-tooltip class="text-body2" anchor="bottom middle">
                    Ver detalles de pagos
                  </q-tooltip>
                </div>
                <q-chip
                  :color="paymentMethodTotals.payment_method_totals?.length ? 'white' : 'orange'"
                  :text-color="paymentMethodTotals.payment_method_totals?.length ? 'green-6' : 'white'"
                  :label="paymentMethodTotals.payment_method_totals?.length || 0"
                  size="sm"
                  dense
                />
              </div>
            </div>
          </template>

          <q-card flat>
            <q-card-section class="dense-content" style="max-height: 350px; overflow-y: auto; padding: 12px;">
              <div v-if="paymentMethodTotals.payment_method_totals?.length">
                <div v-for="method in paymentMethodTotals.payment_method_totals" :key="method.id" class="payment-method-compact q-mb-sm">
                  <div class="row items-center justify-between no-wrap">
                    <div class="col-7">
                      <div class="text-weight-bold text-body2">{{ method.payment_method_name }}</div>
                    </div>
                  </div>

                  <!-- Compact Cash Flow Display -->
                  <div class="cash-flow-compact q-pa-xs rounded-borders q-mt-xs cursor-pointer" @click="openPaymentDetailsDialog(method)">
                    <div class="row q-gutter-xs text-center">
                      <div class="col">
                        <div class="text-caption text-grey-7">Ventas</div>
                        <div class="text-body2 text-weight-bold text-positive">
                          {{ formatNumberCompact(method.sales) }}
                        </div>
                      </div>
                      <div class="col">
                        <div class="text-caption text-grey-7">Flujo</div>
                        <div class="text-body2 text-weight-bold text-primary">
                          {{ formatNumberCompact(method.flow) }}
                        </div>
                      </div>
                      <div class="col">
                        <div class="text-caption text-grey-7">Saldo</div>
                        <div class="text-body2 text-weight-bold" :class="getBalanceColor(method.balance)">
                          {{ formatNumberCompact(method.balance) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- <q-separator v-if="method !== paymentMethodTotals.payment_method_totals[paymentMethodTotals.payment_method_totals.length - 1]" class="q-my-sm"/> -->
                </div>
              </div>
              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="info" size="md"/>
                <div class="text-body2 q-mt-sm">No hay datos de métodos de pago</div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Sales by Category -->
      <div class="col-12 col-md-6">
        <q-expansion-item
          class="report-expansion shadow-4"
          :default-opened="expandedCards.categories"
          @show="expandedCards.categories = true"
          @hide="expandedCards.categories = false"
          header-class="bg-blue-6 text-white expansion-header-compact"
          expand-icon-class="text-white"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-icon name="category" size="sm" class="q-mr-sm"/>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">🏪 Ventas por Departamento</div>
              </div>
              <div class="col-auto flex justify-center items-center q-gutter-x-md">
                <div class="text-body1 text-bold">Total: {{ formatNumber(categoryTotalsTotals.category_total || 0) }}</div>
                <q-chip
                  :color="categoryTotalsTotals.categories_totals?.length ? 'white' : 'orange'"
                  :text-color="categoryTotalsTotals.categories_totals?.length ? 'blue-6' : 'white'"
                  :label="categoryTotalsTotals.categories_totals?.length || 0"
                  size="sm"
                  dense
                />
              </div>
            </div>
          </template>

          <q-card flat>
            <q-card-section class="dense-content" style="max-height: 350px; overflow-y: auto; padding: 12px;">
              <div v-if="categoryTotalsTotals.categories_totals?.length">
                <div v-for="category in categoryTotalsTotals.categories_totals" :key="category.id" class="category-compact q-mb-sm">
                  <div class="row items-center justify-between no-wrap q-mb-xs">
                    <div class="col-7">
                      <div class="text-weight-bold text-body2">{{ category.category_name }}</div>
                      <div class="text-caption text-grey-6">{{ getCategoryPercentage(category.total_sales).toFixed(1) }}% del total</div>
                    </div>
                    <div class="col-5 text-right">
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ formatNumber(category.total_sales) }}
                      </div>
                    </div>
                  </div>

                  <q-linear-progress
                    :value="getCategoryPercentage(category.total_sales) / 100"
                    color="blue-6"
                    size="6px"
                    rounded
                    class="q-mb-xs"
                  />
                </div>
              </div>
              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="info" size="md"/>
                <div class="text-body2 q-mt-sm">No hay datos de categorías</div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Cash Flow Summary -->
      <div class="col-12 col-md-6">
        <q-expansion-item
          class="report-expansion shadow-4"
          :default-opened="expandedCards.cashFlow"
          @show="expandedCards.cashFlow = true"
          @hide="expandedCards.cashFlow = false"
          header-class="bg-purple-6 text-white expansion-header-compact"
          expand-icon-class="text-white"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm"/>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">💰 Flujo de Dinero</div>
              </div>
              <div class="col-auto flex justify-center items-center q-gutter-x-md">
                <div class="text-body1 text-bold" @click.stop="cashFlowDetails">
                  Total: {{ formatNumber(cashflowTotals.cashflow_totals || 0) }}
                  <q-tooltip class="text-body2" anchor="bottom middle">
                    Ver todos los flujos de dinero
                  </q-tooltip>
                </div>
                <q-chip
                  :color="cashflowTotals.cashflow_total?.length ? 'white' : 'orange'"
                  :text-color="cashflowTotals.cashflow_total?.length ? 'purple-6' : 'white'"
                  :label="cashflowTotals.cashflow_total?.length || 0"
                  size="sm"
                  dense
                />
              </div>
            </div>
          </template>

          <q-card flat>
            <q-card-section class="dense-content" style="max-height: 350px; overflow-y: auto; padding: 12px;">
              <div v-if="cashflowTotals.cashflow_total?.length">
                <!-- Compact Cash Flow Items -->
                <div class="q-gutter-xs">
                  <div
                    v-for="cashFlow in cashflowTotals.cashflow_total"
                    :key="cashFlow.id"
                    class="cash-flow-compact q-pa-sm rounded-borders cursor-pointer"
                    @click="cashFlowDetails(cashFlow)"
                  >
                    <div class="row items-center justify-between no-wrap">
                      <div class="col-7">
                        <div class="text-body2 text-weight-medium">
                          <q-icon
                            :name="cashFlow.type_cashflow === 'debit' || cashFlow.type_cashflow === 'init_cashbox' ? 'add_circle' : 'remove_circle'"
                            :color="cashFlow.type_cashflow === 'debit' || cashFlow.type_cashflow === 'init_cashbox' ? 'positive' : 'negative'"
                            size="xs"
                            class="q-mr-xs"
                          />
                          {{ translate[cashFlow.type_cashflow] }}
                        </div>
                        <div class="text-caption text-grey-6">Ver detalles</div>
                      </div>
                      <div class="col-5 text-right">
                        <div class="text-body1 text-weight-bold" :class="cashFlow.type_cashflow === 'debit' || cashFlow.type_cashflow === 'init_cashbox' ? 'text-positive' : 'text-negative'">
                          {{ formatNumberCompact(cashFlow.totals) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="info" size="md"/>
                <div class="text-body2 q-mt-sm">No hay datos de flujo de dinero</div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Service Types -->
      <div class="col-12 col-md-6">
        <q-expansion-item
          class="report-expansion shadow-4"
          :default-opened="expandedCards.services"
          @show="expandedCards.services = true"
          @hide="expandedCards.services = false"
          header-class="bg-orange-6 text-white expansion-header-compact"
          expand-icon-class="text-white"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-icon name="room_service" size="sm" class="q-mr-sm"/>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">🛎️ Tipos de Servicio</div>
              </div>
              <div class="col-auto flex justify-center items-center q-gutter-x-md">
                <div class="text-body1 text-bold">Total: {{ formatNumber(typeOfServicesTotals.payment_total || 0) }}</div>
                <q-chip
                  :color="typeOfServicesTotals.payment_method_totals?.length ? 'white' : 'orange'"
                  :text-color="typeOfServicesTotals.payment_method_totals?.length ? 'orange-6' : 'white'"
                  :label="typeOfServicesTotals.payment_method_totals?.length || 0"
                  size="sm"
                  dense
                />
              </div>
            </div>
          </template>

          <q-card flat>
            <q-card-section class="dense-content" style="max-height: 350px; overflow-y: auto; padding: 12px;">
              <div v-if="typeOfServicesTotals.payment_method_totals?.length">
                <div v-for="service in typeOfServicesTotals.payment_method_totals" :key="service.id" class="service-compact q-mb-sm">
                  <div class="row items-center justify-between no-wrap">
                    <div class="col-7">
                      <div class="text-body2 text-weight-bold">{{ service.type_of_service_name }}</div>
                      <div class="text-caption text-grey-6">{{ getServicePercentage(service.payment_total).toFixed(1) }}% del total</div>
                    </div>
                    <div class="col-5 text-right">
                      <div class="text-h6 text-weight-bold text-orange-8">
                        {{ formatNumber(service.payment_total) }}
                      </div>
                    </div>
                  </div>

                  <q-linear-progress
                    :value="getServicePercentage(service.payment_total) / 100"
                    color="orange-6"
                    size="4px"
                    rounded
                    class="q-mt-xs"
                  />
                </div>
              </div>
              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="info" size="md"/>
                <div class="text-body2 q-mt-sm">No hay datos de servicios</div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Fiscal Report with Print Button -->
      <div class="col-12">
        <q-expansion-item
          class="report-expansion shadow-4"
          :default-opened="expandedCards.fiscal"
          @show="expandedCards.fiscal = true"
          @hide="expandedCards.fiscal = false"
          header-class="bg-indigo-6 text-white expansion-header-compact"
          expand-icon-class="text-white"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-icon name="receipt" size="sm" class="q-mr-sm"/>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">📋 Reporte Fiscal</div>
                <div class="text-caption">Resumen de impuestos y facturación</div>
              </div>
              <div class="col-auto q-gutter-xs">
                <q-btn
                  icon="print"
                  color="white"
                  text-color="indigo-6"
                  size="sm"
                  round
                  dense
                  @click.stop="printReport"
                  class="q-mr-sm"
                >
                  <q-tooltip>Imprimir Reporte Fiscal</q-tooltip>
                </q-btn>
                <q-chip
                  color="white"
                  text-color="indigo-6"
                  label="Fiscal"
                  size="sm"
                  dense
                />
              </div>
            </div>
          </template>
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Primer comprobante
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ taxeTotals?.summary?.first_invoice_id }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Ultimo comprobante
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ taxeTotals?.summary?.last_invoice_id }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Total de comprobantes
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ taxeTotals?.summary?.total_invoices }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Gravado
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ formatNumber(taxeTotals?.summary?.total_base) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      No gravado
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ formatNumber(0.00) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Exento
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ formatNumber(taxeTotals?.ivaBreakdown.find(item => item.taxe_percentage === 0)?.taxe_total || 0) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Discriminación del IVA
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                  v-for="item in taxeTotals?.ivaBreakdown"
                  :key="item.taxe_percentage"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ item.taxe_percentage }}%
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ formatNumber(item.taxe_total) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                >
                  <q-item-section>
                    <q-item-label>
                      Total del IVA
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>
                      {{ formatNumber(taxeTotals?.summary?.total_tax) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item
                clickable
                v-ripple
                style="border-radius: 20px;"
              >
                <q-item-section>
                  <q-item-label>
                    Importe total comp. fiscales
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    {{ formatNumber(taxeTotals?.summary?.total_invoiced) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>

    <!-- Enhanced Filter Dialog -->
    <q-dialog v-model="dialogFilter" position="right" full-height>
      <q-card style="width: 400px; max-width: 90vw" class="column full-height">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">🔍 Filtros de Búsqueda</div>
        </q-card-section>

        <q-card-section class="col q-gutter-md">
          <!-- Date Range -->
          <div>
            <div class="text-subtitle2 q-mb-sm">📅 Período</div>
            <q-option-group
              v-model="panel"
              inline
              :options="[
                { label: 'Un día específico', value: 'day' },
                { label: 'Rango de fechas', value: 'between' }
              ]"
              color="primary"
            />
          </div>

          <q-tab-panels v-model="panel" animated class="shadow-2 rounded-borders">
            <q-tab-panel name="between" class="q-gutter-sm">
              <div class="text-subtitle1 q-mb-sm">📅 Filtrar entre fechas</div>
              <q-input
                v-model="from"
                filled
                label="Fecha inicial"
                type="datetime-local"
                color="primary"
              />
              <q-input
                v-model="to"
                filled
                label="Fecha final"
                type="datetime-local"
                color="primary"
              />
            </q-tab-panel>

            <q-tab-panel name="day" class="q-gutter-sm">
              <div class="text-subtitle1 q-mb-sm">🕐 Filtrar por día y horas</div>
              <q-input
                v-model="day"
                filled
                label="Fecha del día"
                type="date"
                color="primary"
              />
              <div class="row">
                <q-input
                  v-model="fromHours"
                  filled
                  label="Desde"
                  type="time"
                  class="col"
                  color="primary"
                />
                <q-input
                  v-model="toHours"
                  filled
                  label="Hasta"
                  type="time"
                  class="col q-ml-xs"
                  color="primary"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
          <!-- Seller Filter -->
          <div v-if="validate">
            <div class="text-subtitle2 q-mb-sm">👤 Vendedor</div>
            <q-select
              v-model="seller"
              use-input
              filled
              label="Seleccionar vendedor"
              input-debounce="0"
              option-value="id"
              :option-label="(row) => `${row.document_number ?? ''} | ${row.name}`"
              :options="sellers"
              clearable
              @filter="filterSellers"
              color="primary"
            />
          </div>
          <!-- Branch Office Filter -->
          <div v-if="validate">
            <div class="text-subtitle2 q-mb-sm">🏢 Sucursales</div>
            <q-select
              v-model="branchOfficeSelect"
              :options="branchOffices"
              style="min-width: 300px;"
              label="Seleccionar sucursales"
              option-value="id"
              option-label="name"
              filled
              multiple
              color="primary"
            >
              <template v-if="branchOfficeSelect.length" v-slot:append>
                <q-icon name="cancel" @click.stop.prevent="branchOfficeSelect = []" class="cursor-pointer" />
              </template>
            </q-select>
          </div>
          <div v-if="validate">
            <div class="text-subtitle2 q-mb-sm">🔄 Turno</div>
            <q-select
              v-model="cashBoxUser"
              use-input
              filled
              label="Seleccionar turnos"
              input-debounce="0"
              option-value="id"
              :option-label="(row) => `${row.user?.name || ''} | ${row.cashbox?.name || ''} | ${formatDate(row.created_at, 'DD/MM/YYYY H:m:s')}`"
              :options="cashBoxUsers"
              clearable
              @filter="filterCashBoxUser"
              color="primary"
            />
          </div>

        </q-card-section>

        <q-card-actions class="q-pa-md">
          <q-btn
            color="grey-6"
            label="Limpiar"
            icon="filter_alt_off"
            class="col"
            @click="clearFilter"
          />
          <q-btn
            color="primary"
            label="Aplicar"
            icon="filter_alt"
            class="col q-ml-sm"
            @click="filterDate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Payment Details Dialog -->
    <q-dialog v-model="paymentDetailsDialog">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">💳 Detalle de Pagos por Método</div>
          <q-space/>
          <q-btn icon="close" flat round @click="paymentDetailsDialog = false"/>
        </q-card-section>

        <q-card-section>
          <q-table
            v-if="invoicePayments.data?.length"
            :columns="paymentColumns"
            :rows="invoicePayments.data || []"
            :loading="paymentDetailsLoading"
            v-model:pagination="paymentDetailsPagination"
            @request="setPaymentDetailsPagination"
            binary-state-sort
            no-data-label="No se encontraron pagos en el período seleccionado"
            row-key="id"
          >
            <template v-slot:top-right>
              <q-input
                v-model="paymentSearchFilter"
                filled
                dense
                debounce="500"
                placeholder="Buscar pagos..."
                @update:model-value="onPaymentSearch"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>

          <div v-else class="text-center q-pa-xl text-grey-6">
            <q-icon name="info" size="xl"/>
            <div class="text-h6 q-mt-md">No hay datos de pagos</div>
            <div class="text-body2 q-mt-sm">No se encontraron pagos en el período seleccionado</div>
          </div>
        </q-card-section>
        <q-inner-loading :showing="paymentDetailsLoading" color="primary" />
      </q-card>
    </q-dialog>

    <!-- Cash Flow Details Dialog -->
    <q-dialog v-model="cashFlowDetailsDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">💰 Detalle de Flujo de Dinero</div>
          <q-space/>
          <q-btn icon="close" flat round @click="cashFlowDetailsDialog = false"/>
        </q-card-section>

        <q-card-section>
          <q-markup-table v-if="cashflows.data?.length">
            <thead>
              <tr>
                <th class="text-left">Método de pago</th>
                <th class="text-left">Fecha</th>
                <th class="text-left">Hora</th>
                <th class="text-left">Descripción</th>
                <th class="text-right">Monto</th>
                <th class="text-right" v-if="userSession?.is_root">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cashflows.data" :key="item.id">
                <td class="text-left">
                  {{ item.payment_method?.name }}
                </td>
                <td class="text-left">
                  {{ formatDate(item.created_at, 'DD/MM/YYYY') }}
                </td>
                <td class="text-left">
                  {{ formatDate(item.created_at, 'HH:mm:ss') }}
                </td>
                <td class="text-left">
                  {{ item.description }}
                </td>
                <td class="text-right" :class="item.type_cashflow === 'debit' ? 'text-positive' : 'text-negative'">
                  {{ formatNumber(item.amount) }}
                </td>
                <td v-if="userSession?.is_root" class="text-right">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="deleteCashflow(item)"
                  />
                </td>
              </tr>
              <tr>
                <th colspan="4" class="text-right">
                  <span class="text-subtitle1">Total:</span>
                </th>
                <th colspan="2" :class="cashflows.total > 0 ? 'text-positive' : 'text-negative'" class="text-left">
                  <span class="text-subtitle1 q-ml-lg">
                    {{ formatNumber(cashflows.total) }}
                  </span>
                </th>
              </tr>
            </tbody>
          </q-markup-table>
          <div v-else class="text-center q-pa-xl text-grey-6">
            <q-icon name="info" size="xl"/>
            <div class="text-h6 q-mt-md">No hay detalles disponibles</div>
          </div>
        </q-card-section>

        <q-inner-loading :showing="cashFlowLoading" color="primary" />
      </q-card>
    </q-dialog>

    <!-- Loading -->
    <q-inner-loading :showing="loading" color="primary"/>
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { date } from 'quasar'
import { formatDate, formatNumber } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { notify } from '../const/mixins'
import { printReportTaxes } from 'src/const/report'

export default {
  name: 'BoxReportPage',

  data () {
    return {
      loading: false,
      cashBoxUser: null,
      cashFlowDetailsDialog: false,
      cashFlowLoading: false,
      paymentDetailsDialog: false,
      paymentDetailsLoading: false,
      invoicePayments: { data: [] },
      paymentDetailsPagination: {
        rowsPerPage: 10,
        rowsNumber: 0,
        paginate: true,
        sortBy: 'created_at',
        selectedPaymentMethod: null
      },
      paymentMethodFilters: [
        { label: 'Todos los métodos', value: null },
        { label: 'Efectivo', value: 'efectivo' },
        { label: 'Débito', value: 'debito' },
        { label: 'Crédito', value: 'credito' }
      ],
      selectedPaymentFilter: null,
      paymentSearchFilter: '',
      paymentColumns: [
        {
          name: 'invoice_number',
          align: 'left',
          label: 'Factura',
          field: row => row.invoice?.invoice_number || row.invoice?.code || 'N/A',
          sortable: true
        },
        {
          name: 'customer',
          align: 'left',
          label: 'Cliente',
          field: row => row.invoice?.customer?.name || row.invoice?.client?.name || 'Cliente General',
          sortable: true
        },
        {
          name: 'payment_method',
          align: 'left',
          label: 'Método de Pago',
          field: row => row.payment_method?.name,
          sortable: true
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Fecha y Hora',
          field: 'created_at',
          format: val => `${formatDate(val, 'DD/MM/YYYY')} ${formatDate(val, 'HH:mm:ss')}`,
          sortable: true
        },
        {
          name: 'amount',
          align: 'right',
          label: 'Monto',
          field: row => row.amount - row.discount_amount,
          format: val => formatNumber(val),
          sortable: true
        }
      ],
      formatDate,
      panel: 'day',
      formatNumber,
      translate: {
        debit: 'Entrada',
        credit: 'Salida',
        withdrawal: 'Arqueo',
        init_cashbox: 'Apertura',
        close_cashbox: 'Cierre'
      },
      fromHours: null,
      toHours: null,
      day: date.formatDate(Date(), 'YYYY-MM-DD'),
      from: date.formatDate(Date(), 'YYYY-MM-DDTHH:mm'),
      to: date.formatDate(Date(), 'YYYY-MM-DDTHH:mm'),
      cashflowTotals: {},
      dialogFilter: false,
      filter: null,
      params: {},
      taxeTotals: null,
      visible: false,
      cashflows: {},
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      totals: [],
      typeOfServicesTotals: {},
      paymentMethodTotals: {},
      categoryTotalsTotals: {},
      sellers: [],
      seller: null,
      validate: null,
      permissions: ['SAM'],
      cashBoxUsers: [],
      branchOffices: [],
      branchOfficeSelect: [],

      // Expansion state management
      expandedCards: {
        paymentMethods: true,
        categories: true,
        cashFlow: true,
        services: true,
        fiscal: false,
        summary: false
      },

      appliedBranchOfficeSelect: []
    }
  },

  watch: {
    isPaymentDetailsDialogOpen (newValue) {
      if (!newValue) {
        // Reset details when dialog is closed
        this.paymentDetails = []
        this.paymentDetailsPagination.filter = ''
        this.paymentDetailsPagination.page = 1
        this.paymentDetailsPagination.rowsNumber = 0
        this.selectedPaymentMethod = null
      }
    },
    branchOffice (data) {
      if (data) {
        this.filterDate()
      }
    },
    validate (data) {
      if (!data) {
        this.seller = this.userSession
      }
      this.filterDate()
    }
  },

  created () {
    this.setPermissions()
    this.getBranchOffices().then(() => {
      if (this.branchOffice) {
        this.branchOfficeSelect = [this.branchOffice] // Mantén la inicialización de branchOfficeSelect si es necesario
        this.appliedBranchOfficeSelect = [this.branchOffice] // Inicializa appliedBranchOfficeSelect con la sucursal actual
      }
    })
  },

  computed: {
    ...mapState(authentication, ['branchOffice', 'userSession']),

    isToday () {
      return this.day === date.formatDate(Date(), 'YYYY-MM-DD')
    },

    isYesterday () {
      const yesterday = date.subtractFromDate(Date(), { days: 1 })
      return this.day === date.formatDate(yesterday, 'YYYY-MM-DD')
    },

    reportTitle () {
      if (this.appliedBranchOfficeSelect && this.appliedBranchOfficeSelect.length > 0) {
        if (this.appliedBranchOfficeSelect.length === 1) {
          return this.appliedBranchOfficeSelect[0].name
        } else {
          if (this.branchOffices && this.branchOffices.length > 0 && this.appliedBranchOfficeSelect.length === this.branchOffices.length && this.appliedBranchOfficeSelect.every(selected => this.branchOffices.some(branch => branch.id === selected.id))) {
            return 'Todas las sucursales'
          } else {
            return this.appliedBranchOfficeSelect.map(branch => branch.name).join(', ')
          }
        }
      }
      return this.branchOffice?.name || 'Cargando...'
    }
  },

  methods: {
    setPermissions () {
      this.validate = this.userSession?.is_root ||
        this.userSession?.roles?.some((role) => this.permissions.includes(role.acronym))
    },

    // Compact number formatting for better space utilization
    formatNumberCompact (amount) {
      return this.formatNumber(amount)
    },
    /**
     * Format date
     * @param {String} date
     * @param {String} format
     */
    async printReport () {
      const doc = await printReportTaxes(this.taxeTotals, this.userSession, this.params, this.voucherType)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
    },

    selectQuickDate (period) {
      const today = new Date()

      switch (period) {
        case 'today': {
          this.panel = 'day'
          this.day = date.formatDate(today, 'YYYY-MM-DD')
          this.fromHours = null
          this.toHours = null
          break
        }
        case 'yesterday': {
          this.panel = 'day'
          const yesterday = date.subtractFromDate(today, { days: 1 })
          this.day = date.formatDate(yesterday, 'YYYY-MM-DD')
          this.fromHours = null
          this.toHours = null
          console.log(yesterday, this.day)
          break
        }
        case 'month': {
          this.panel = 'between'
          const weekStart = date.startOfDate(today, 'month')
          this.from = date.formatDate(weekStart, 'YYYY-MM-DD')
          this.to = date.formatDate(today, 'YYYY-MM-DD')
          break
        }
      }

      this.filterDate()
    },

    getCategoryPercentage (categoryTotal) {
      const total = this.categoryTotalsTotals.category_total || 0
      return total > 0 ? (categoryTotal / total) * 100 : 0
    },

    getServicePercentage (serviceTotal) {
      const total = this.typeOfServicesTotals.payment_total || 0
      return total > 0 ? (serviceTotal / total) * 100 : 0
    },

    getCashFlowByType (type) {
      const cashFlow = this.cashflowTotals.cashflow_total?.find(cf => cf.type_cashflow === type)
      return cashFlow ? cashFlow.totals : 0
    },

    getPaymentMethodCashFlow (paymentMethodName) {
      const relatedCashFlow = this.cashflowTotals.cashflow_total?.filter(cf =>
        cf.description?.toLowerCase().includes(paymentMethodName.toLowerCase())
      ) || []

      return relatedCashFlow.reduce((sum, cf) => {
        return sum + (cf.type_cashflow === 'debit' || cf.type_cashflow === 'init_cashbox' ? cf.totals : -cf.totals)
      }, 0)
    },

    getBalanceColor (balance) {
      if (balance > 0) return 'text-positive'
      if (balance < 0) return 'text-negative'
      return 'text-grey-6'
    },

    getTotalProfit () {
      const sales = this.categoryTotalsTotals.category_total || 0
      const costs = this.categoryTotalsTotals.cost_total || 0
      return sales - costs
    },

    getProfitColor (profit) {
      if (profit > 0) return 'text-positive'
      if (profit < 0) return 'text-negative'
      return 'text-grey-6'
    },

    getProfitBgColor (profit) {
      if (profit > 0) return 'bg-green-1'
      if (profit < 0) return 'bg-red-1'
      return 'bg-grey-2'
    },

    getProfitIconColor (profit) {
      if (profit > 0) return 'green-6'
      if (profit < 0) return 'red-6'
      return 'grey-6'
    },
    /**
     * Clear filters
     */
    clearFilter () {
      this.day = date.formatDate(Date(), 'YYYY-MM-DD')
      this.fromHours = null
      this.toHours = null
      this.seller = null
      this.from = date.formatDate(Date(), 'YYYY-MM-DD')
      this.to = date.formatDate(Date(), 'YYYY-MM-DD')
      this.panel = 'day'
      // Reset branch office filter
      if (this.userSession.is_root) {
        this.branchOfficeSelect = this.branchOffices
      } else {
        this.branchOfficeSelect = [this.branchOffice]
      }
      this.filterDate()
    },
    /**
     * Filter sellers by name or document number
     * @param {string} value
     * @param {Function} update
     */
    async filterSellers (value, update) {
      try {
        const { data } = await this.$api.get('sellers', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.sellers = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Filter cashier box users by username
     * @param {string} value
     * @param {Function} update
     */
    async filterCashBoxUser (value, update) {
      try {
        const { data } = await this.$api.get('cashier-boxes', {
          params: {
            userName: value,
            cashier_id: this.seller?.id,
            ...this.formatFilter()
          }
        })
        update(() => {
          this.cashBoxUsers = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    formatFilter () {
      let params = {}

      if (this.panel === 'day') {
        params = {
          seller_id: this.seller?.id,
          day: this.day,
          fromHours: this.fromHours,
          toHours: this.toHours
        }
      } else {
        params = {
          seller_id: this.seller?.id,
          to: this.to,
          from: this.from
        }
      }

      // Apply branch office filter with all selected IDs
      const branchOfficeIds = this.branchOfficeSelect && this.branchOfficeSelect.length > 0
        ? this.branchOfficeSelect.map(branch => branch.id)
        : (this.branchOffice?.id ? [this.branchOffice.id] : [])

      if (branchOfficeIds.length > 0) {
        params.branch_office_id = branchOfficeIds
      }

      return params
    },

    async filterDate () {
      if (!this.branchOffice?.id) return
      this.appliedBranchOfficeSelect = [...this.branchOfficeSelect] // Actualiza con el valor seleccionado del filtro
      this.params = this.formatFilter()
      this.params.cashbox_user_id = this.cashBoxUser?.id || null
      this.loading = true
      this.dialogFilter = false
      try {
        await Promise.all([
          this.getCategoryTotals(this.params),
          this.getPaymentMethodTotals(this.params),
          this.getPaymentTotals(this.params),
          this.getCashflowTotals(this.params)
        ])
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loading = false
      }
    },

    async getCashflowTotals (params) {
      try {
        const { data } = await this.$api.get('reports/cashflow-totals', { params })
        this.cashflowTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    /**
     * Get total all
     * @param {Object} params
     */
    async reportInvoiceTaxes (params) {
      try {
        const { data } = await this.$api.get('reports/report-invoice-taxes', { params })
        this.taxeTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    cashFlowDetails (data) {
      this.cashFlowDetailsDialog = true
      this.getCashflowDetails({
        ...this.params,
        type_cashflow: data?.type_cashflow
      })
    },

    /**
     * Opens payment details modal and loads payment data
     */
    paymentDetailsModal () {
      this.paymentDetailsDialog = true
      this.paymentDetailsLoading = true
      // Clear selected payment method for "Total" view
      this.selectedPaymentMethod = null
      // Reset pagination to first page
      this.paymentDetailsPagination.page = 1
      this.paymentDetailsPagination.rowsPerPage = 10
      // Load initial data with pagination
      this.loadInitialPaymentData()
    },

    deleteCashflow (cashflow) {
      console.log(cashflow)
      this.$api.delete(`cashflows/${cashflow.id}`)
        .then(() => {
          this.cashFlowDetails(cashflow)
          this.getCashflowTotals()
          notify('Flujo de dinero eliminado correctamente', 'positive', 'check')
        })
        .catch(error => {
          notify(error.message, 'negative', 'warning')
        })
    },

    /**
     * Load initial payment data for modal
     */
    async loadInitialPaymentData () {
      try {
        this.paymentDetailsLoading = true

        // Build parameters similar to AccountsReceivablePage
        const paymentsParams = {
          paginate: true,
          sortBy: this.paymentDetailsPagination.sortBy || 'created_at',
          sortOrder: this.paymentDetailsPagination.descending ? 'asc' : 'desc',
          perPage: this.paymentDetailsPagination.rowsPerPage,
          page: this.paymentDetailsPagination.page,
          dataSearch: {
            'invoice.id': '',
            amount: ''
          }
        }

        // Build filters with correct structure
        const branchOfficeId = this.branchOfficeSelect && this.branchOfficeSelect.length > 0
          ? this.branchOfficeSelect[0].id
          : this.branchOffice?.id

        const filtersPayments = {
          dataEqualFilter: {
            'invoice.seller_id': this.seller?.id,
            'invoice.branch_office_id': branchOfficeId
          }
        }
        console.log('HOLA', this.selectedPaymentMethod)
        // Add payment method filter if a specific method was selected
        if (this.selectedPaymentMethod && this.selectedPaymentMethod.payment_method_id) {
          filtersPayments.dataEqualFilter.payment_method_id = this.selectedPaymentMethod.payment_method_id
        }

        // Add date filters according to active panel
        if (this.panel === 'day' && this.day) {
          filtersPayments.dateFilter = {
            field: 'created_at',
            from: `${this.day} ${this.fromHours || '00:00'}`,
            to: `${this.day} ${this.toHours || '23:59'}`
          }
        } else if (this.panel === 'between' && this.from && this.to) {
          filtersPayments.dateFilter = {
            field: 'created_at',
            from: this.from,
            to: this.to
          }
        }

        // Combine parameters and filters
        const finalParams = {
          ...paymentsParams,
          ...filtersPayments
        }

        const { data } = await this.$api.get('invoice-payments', { params: finalParams })
        // IMPORTANT: Response comes in data.data
        this.invoicePayments = { data: data.data || [] }
        this.paymentDetailsPagination.rowsNumber = data.total || 0
      } catch (error) {
        this.$q.notify({
          message: error.message || 'Error al cargar los pagos',
          color: 'negative',
          icon: 'warning'
        })
      } finally {
        this.paymentDetailsLoading = false
      }
    },

    /**
     * Set payment details pagination
     * @param {Object} data - Pagination data from q-table
     */
    setPaymentDetailsPagination (data) {
      const paymentsParams = {
        paginate: true,
        sortBy: data.pagination.sortBy || 'created_at',
        sortOrder: data.pagination.descending ? 'asc' : 'desc',
        perPage: data.pagination.rowsPerPage,
        page: data.pagination.page,
        dataSearch: {
          'invoice.id': '',
          amount: ''
        }
      }

      // Construir filtros con estructura correcta
      const branchOfficeIds = this.branchOfficeSelect && this.branchOfficeSelect.length > 0
        ? this.branchOfficeSelect.map(branch => branch.id)
        : [this.branchOffice?.id]

      const filtersPayments = {
        dataEqualFilter: {
          'invoice.seller_id': this.seller?.id
        }
      }

      // Add branch office filter
      if (branchOfficeIds.length === 1) {
        filtersPayments.dataEqualFilter['invoice.branch_office_id'] = branchOfficeIds[0]
      } else {
        filtersPayments.whereIn = {
          'invoice.branch_office_id': branchOfficeIds
        }
      }

      // Add payment method filter if a specific method was selected
      if (this.selectedPaymentMethod && this.selectedPaymentMethod.payment_method_id) {
        filtersPayments.dataEqualFilter.payment_method_id = this.selectedPaymentMethod.payment_method_id
      }

      // Agregar filtros de fecha según el panel activo
      if (this.panel === 'day' && this.day) {
        filtersPayments.dateFilter = {
          field: 'created_at',
          from: `${this.day} ${this.fromHours || '00:00'}`,
          to: `${this.day} ${this.toHours || '23:59'}`
        }
      } else if (this.panel === 'between' && this.from && this.to) {
        filtersPayments.dateFilter = {
          field: 'created_at',
          from: this.from,
          to: this.to
        }
      }

      // Combinar parámetros y filtros
      const finalParams = {
        ...paymentsParams,
        ...filtersPayments
      }

      this.paymentDetailsPagination = data.pagination
      this.getInvoicePaymentsPaginated(finalParams)
    },

    /**
     * Get invoice payments with pagination
     * @param {Object} params - Complete parameters with pagination
     */
    async getInvoicePaymentsPaginated (params) {
      try {
        this.paymentDetailsLoading = true
        const { data } = await this.$api.get('invoice-payments', { params })
        this.invoicePayments = { data: data.data || [] }
        this.paymentDetailsPagination.rowsNumber = data.total || 0
      } catch (error) {
        this.$q.notify({
          message: error.message || 'Error al cargar los pagos',
          color: 'negative',
          icon: 'warning'
        })
      } finally {
        this.paymentDetailsLoading = false
      }
    },

    async getCashflowDetails (params) {
      try {
        this.cashFlowLoading = true
        const { data } = await this.$api.get('reports/cashflow-details', { params })
        this.cashflows = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cashFlowLoading = false
      }
    },

    async getTypeOfServicesTotals (params) {
      try {
        const { data } = await this.$api.get('reports/type-of-services-totals', { params })
        this.typeOfServicesTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    getPaymentTotals (params) {
      return this.$api
        .get('reports/payment-totals', { params })
        .then(({ data }) => {
          this.totals = data
        })
        .catch((err) => {
          console.error(err.message)
        })
    },

    async getPaymentMethodTotals (params) {
      try {
        const { data } = await this.$api.get('reports/payment-method-totals', { params })
        this.paymentMethodTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    async openPaymentDetailsDialog (method) {
      this.modalTitle = method?.payment_method_name || 'Todos los Pagos'
      this.paymentDetailsDialog = true
      this.paymentDetailsLoading = true
      // Store selected method to use in pagination requests
      this.selectedPaymentMethod = method
      // Reset pagination
      this.paymentDetailsPagination.page = 1
      this.loadInitialPaymentData()
    },

    async handlePaymentDetailsRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter

      // Use pagination parameters from request
      this.paymentDetailsPagination.page = page
      this.paymentDetailsPagination.rowsPerPage = rowsPerPage

      // Use same structure as getInvoicePaymentsPaginated
      const finalParams = {
        'invoice.invoice_date': {
          startDate: this.params.startDate,
          endDate: this.params.endDate
        },
        rowsPerPage,
        page,
        sortBy: sortBy || 'created_at',
        descending: descending !== false,
        dataSearch: {
          'invoice.id': '',
          amount: filter || this.paymentSearchFilter || ''
        }
      }

      // Build filters with correct structure
      const branchOfficeIds = this.branchOfficeSelect && this.branchOfficeSelect.length > 0
        ? this.branchOfficeSelect.map(branch => branch.id)
        : [this.branchOffice?.id]

      const filtersPayments = {
        dataEqualFilter: {
          'invoice.seller_id': this.seller?.id
        }
      }

      // Add branch office filter
      if (branchOfficeIds.length === 1) {
        filtersPayments.dataEqualFilter['invoice.branch_office_id'] = branchOfficeIds[0]
      } else {
        filtersPayments.whereIn = {
          'invoice.branch_office_id': branchOfficeIds
        }
      }

      // Add payment method filter
      if (this.selectedPaymentFilter) {
        filtersPayments.dataLikeFilter = {
          'payment_method.name': this.selectedPaymentFilter
        }
      }

      // Merge filters into final params
      const requestParams = {
        ...finalParams,
        ...filtersPayments
      }

      try {
        this.paymentDetailsLoading = true
        const { data } = await this.$api.get('invoice-payments', { params: requestParams })
        this.invoicePayments = { data: data.data || [] }
        this.paymentDetailsPagination = {
          ...props.pagination,
          rowsNumber: data.total || 0,
          filter: props.filter
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.paymentDetailsLoading = false
      }
    },

    /**
     * Handle payment method filter change
     */
    onPaymentFilterChange () {
      // Reset pagination and reload data
      this.paymentDetailsPagination.page = 1
      this.loadInitialPaymentData()
    },

    /**
     * Handle payment search filter change
     */
    onPaymentSearch () {
      // Reset pagination and reload data
      this.paymentDetailsPagination.page = 1
      this.loadInitialPaymentData()
    },

    /**
     * Refresh payment data
     */
    refreshPaymentData () {
      this.loadInitialPaymentData()
    },

    /**
     * Get branch offices based on user permissions
     */
    async getBranchOffices () {
      try {
        if (this.userSession.is_root) {
          const { data } = await this.$api.get('branch-offices')
          this.branchOffices = data
          this.branchOfficeSelect = data
        } else {
          this.branchOffices = [this.branchOffice]
          this.branchOfficeSelect = [this.branchOffice]
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
        console.error('Error fetching branch offices:', error)
      }
    },

    async getCategoryTotals (params) {
      try {
        const { data } = await this.$api.get('reports/category-totals', { params })
        this.categoryTotalsTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    }
  }
}
</script>

<style scoped>
.report-expansion {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.summary-expansion {
  border-radius: 16px;
  overflow: hidden;
}

.expansion-header-compact {
  padding: 12px 16px;
  min-height: 60px;
}

.dense-content {
  padding: 8px;
}

.dense-content::-webkit-scrollbar {
  width: 4px;
}

.dense-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.dense-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.dense-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.payment-method-compact {
  padding-left: 8px;
  background: rgba(76, 175, 80, 0.03);
  border-radius: 6px;
  padding: 8px;
}

.category-compact {
  border-left: 3px solid #2196F3;
  padding-left: 8px;
  background: rgba(33, 150, 243, 0.03);
  border-radius: 6px;
  padding: 8px;
}

.service-compact {
  border-left: 3px solid #FF9800;
  padding-left: 8px;
  background: rgba(255, 152, 0, 0.03);
  border-radius: 6px;
  padding: 8px;
}

.cash-flow-compact {
  background: rgba(156, 39, 176, 0.03);
  border: 1px solid rgba(156, 39, 176, 0.1);
  transition: all 0.2s ease;
  padding: 6px;
}

.cash-flow-compact:hover {
  background: rgba(156, 39, 176, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.15);
}

.fiscal-breakdown-compact {
  background: rgba(63, 81, 181, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(63, 81, 181, 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.rounded-borders {
  border-radius: 8px;
}

.no-wrap {
  flex-wrap: nowrap;
}

/* Compact responsive adjustments */
@media (max-width: 600px) {
  .expansion-header-compact {
    padding: 10px 12px;
    min-height: 50px;
  }

  .dense-content {
    padding: 6px;
    max-height: 250px !important;
  }

  .row.q-col-gutter-md > div {
    margin-bottom: 8px;
  }
}

/* Enhanced compact animations */
.q-expansion-item__content {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.report-expansion:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.summary-expansion:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* Print styles */
@media print {
  .q-page {
    padding: 0;
  }

  .report-expansion,
  .summary-expansion {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
