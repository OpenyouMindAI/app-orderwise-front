<template>
  <div class="modern-container q-pa-md">
    <div v-if="!selectedClient" class="fade-in">
      <!-- Header with gradient -->
      <div class="modern-header">
        <div class="header-content">
          <div class="header-title-section">
            <div class="icon-wrapper gradient-primary">
              <q-icon name="account_balance_wallet" size="32px" color="white" />
            </div>
            <div>
              <span class="modern-title">Cuentas por Cobrar</span>
              <p class="modern-subtitle">Estado de cuenta por cliente</p>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              dense
              round
              :icon="store.hideAmounts ? 'visibility' : 'visibility_off'"
              @click="store.toggleHideAmounts()"
              class="toggle-amounts-btn text-white"
            >
              <q-tooltip>
                {{ store.hideAmounts ? 'Mostrar montos' : 'Ocultar montos' }}
              </q-tooltip>
            </q-btn>
            <q-btn
              icon="filter_alt"
              label="Filtros"
              unelevated
              class="modern-btn-secondary"
              @click="filterDialog = true"
            >
              <q-badge color="primary" floating v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</q-badge>
            </q-btn>
            <div class="branch-badge">
              <q-icon name="store" size="18px" class="q-mr-xs" />
              {{ selectedBranchOffice?.name || 'Todas las sucursales' }}
            </div>
          </div>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card kpi-danger hover-lift">
          <div class="kpi-icon-wrapper gradient-danger">
            <q-icon name="receipt_long" size="28px" color="white" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Adeudado</div>
            <div class="kpi-value text-negative">{{ store.hideAmounts ? '********' : formatCurrency(globalKpis.total_owed) }}</div>
            <div class="kpi-trend">
              <q-icon name="trending_up" size="16px" />
              <span>Facturas pendientes</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-success hover-lift">
          <div class="kpi-icon-wrapper gradient-success">
            <q-icon name="payments" size="28px" color="white" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Cobrado</div>
            <div class="kpi-value text-positive">{{ store.hideAmounts ? '********' : formatCurrency(globalKpis.total_paid) }}</div>
            <div class="kpi-trend">
              <q-icon name="check_circle" size="16px" />
              <span>Pagos recibidos</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-warning hover-lift">
          <div class="kpi-icon-wrapper gradient-warning">
            <q-icon name="account_balance_wallet" size="28px" color="white" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Saldo Pendiente</div>
            <div class="kpi-value text-primary">{{ store.hideAmounts ? '********' : formatCurrency(globalKpis.balance) }}</div>
            <div class="kpi-trend">
              <q-icon name="schedule" size="16px" />
              <span>Por cobrar</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-info hover-lift">
          <div class="kpi-icon-wrapper gradient-info">
            <q-icon name="people" size="28px" color="white" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Clientes</div>
            <div class="kpi-value text-primary">{{ globalKpis.client_count }}</div>
            <div class="kpi-trend">
              <q-icon name="groups" size="16px" />
              <span>Con saldo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Clients Table -->
      <q-card>
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="text-h6">Clientes con Saldo Pendiente</div>
            <q-space />
            <q-input
              v-model="search"
              filled
              dense
              placeholder="Buscar cliente..."
              style="width: 300px"
              @update:model-value="searchClients"
            >
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <q-table
            :rows="clients"
            :columns="clientColumns"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            :filter="search"
            @request="onRequest"
            @update:pagination="pagination = $event"
            @row-click="viewClientStatement"
            class="cursor-pointer"
            binary-state-sort
            :grid="$q.screen.lt.md"
          >
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="viewClientStatement(null, props.row)">
                  <span class="q-focus-helper"></span>

                  <q-card-section class="row justify-between items-start compact-card-header">
                    <div class="column">
                       <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                       <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.document_number }}</div>
                    </div>
                    <div class="column items-end">
                       <q-badge
                         color="primary"
                         :label="`${props.row.invoice_count} Facturas`"
                         class="q-py-xs q-px-sm text-weight-bold shadow-1"
                         rounded
                         style="font-size: 10px; letter-spacing: 0.5px"
                       />
                    </div>
                  </q-card-section>

                  <q-separator color="grey-2" inset />

                  <q-card-section class="compact-card-body">
                    <div class="row q-col-gutter-y-sm">
                      <div class="col-6">
                         <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Facturado</div>
                         <div class="text-body2 text-negative text-weight-bold ellipsis">{{ formatCurrency(props.row.total_owed) }}</div>
                      </div>
                      <div class="col-6 text-right">
                         <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Pagado</div>
                         <div class="text-body2 text-positive text-weight-bold">{{ formatCurrency(props.row.total_paid) }}</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="compact-card-footer">
                    <div class="row items-center justify-between bg-grey-1 compact-total-container" style="border-radius: 12px">
                        <div>
                          <div class="text-caption text-grey-6 text-weight-medium">Saldo Pendiente</div>
                          <div class="text-h6 text-primary text-weight-bolder lh-100" style="letter-spacing: -0.5px">
                            {{ store.hideAmounts ? '********' : formatCurrency(props.row.balance) }}
                          </div>
                        </div>
                        <div class="row q-gutter-x-sm">
                          <q-btn
                            round
                            unelevated
                            color="primary"
                            icon="visibility"
                            size="md"
                            class="shadow-1"
                            @click.stop="viewClientStatement(null, props.row)"
                          >
                            <q-tooltip>Ver estado</q-tooltip>
                          </q-btn>
                          <q-btn
                            v-if="Number(props.row.balance) > 0"
                            round
                            unelevated
                            color="positive"
                            icon="payment"
                            size="md"
                            class="shadow-1"
                            @click.stop="openGlobalPaymentDialog(props.row)"
                          >
                            <q-tooltip>Pagar</q-tooltip>
                          </q-btn>
                        </div>
                     </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
            <template #body-cell-total_owed="props">
              <q-td :props="props" class="text-right">
                <div class="text-weight-bold text-negative" style="font-size: 15px;">
                  {{ formatCurrency(props.row.total_owed) }}
                </div>
              </q-td>
            </template>

            <template #body-cell-total_paid="props">
              <q-td :props="props" class="text-right">
                <div class="text-weight-bold text-positive" style="font-size: 15px;">
                  {{ formatCurrency(props.row.total_paid) }}
                </div>
              </q-td>
            </template>

            <template #body-cell-balance="props">
              <q-td :props="props" class="text-right bg-primary-1">
                <div class="text-weight-bold text-primary" style="font-size: 16px;">
                  {{ formatCurrency(props.row.balance) }}
                </div>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props">
                <div class="row q-gutter-xs no-wrap">
                  <q-btn
                    icon="visibility"
                    size="sm"
                    round
                    flat
                    color="primary"
                    @click.stop="viewClientStatement(null, props.row)"
                  >
                    <q-tooltip>Ver estado de cuenta</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="Number(props.row.balance) > 0"
                    icon="payment"
                    size="sm"
                    round
                    flat
                    color="positive"
                    @click.stop="openGlobalPaymentDialog(props.row)"
                  >
                    <q-tooltip>Registrar pago</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- ============================================ -->
    <!-- VIEW 2: CLIENT ACCOUNT STATEMENT -->
    <!-- ============================================ -->
    <div v-else class="fade-in">
      <!-- Client Header - Modern -->
      <div class="client-header">
        <div class="client-header-content">
          <div class="client-info-section">
            <q-btn
              icon="arrow_back"
              flat
              round
              color="white"
              size="md"
              @click="backToClients"
              class="back-btn"
            />
            <div class="client-avatar">
              <q-icon name="person" size="32px" color="white" />
            </div>
            <div class="client-details">
              <span class="client-name">{{ selectedClient.name }}</span>
              <p class="client-doc">
                <q-icon name="badge" size="16px" />
                {{ selectedClient.document_number }}
              </p>
            </div>
          </div>
          <div class="client-actions">
            <q-btn
              v-if="Number(statement?.summary?.current_balance) > 0"
              icon="payment"
              label="Registrar Pago"
              unelevated
              class="modern-btn-white"
              @click="openGlobalPaymentDialog(selectedClient)"
            />
            <q-btn
              icon="download"
              flat
              round
              color="white"
              @click="exportClientStatement"
            >
              <q-tooltip>Exportar PDF</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              :icon="store.hideAmounts ? 'visibility' : 'visibility_off'"
              @click="store.toggleHideAmounts()"
              class="toggle-amounts-btn text-white"
            >
              <q-tooltip>
                {{ store.hideAmounts ? 'Mostrar montos' : 'Ocultar montos' }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Date Filters -->
      <div class="date-filters-section q-mb-md">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-sm-auto">
                <div class="text-subtitle2 text-weight-medium">
                  <q-icon name="date_range" size="18px" class="q-mr-xs" />
                  Filtrar por fecha
                </div>
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="dateFilters.from"
                  label="Desde"
                  type="date"
                  outlined
                  dense
                  clearable
                  @update:model-value="applyDateFilters"
                >
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="dateFilters.to"
                  label="Hasta"
                  type="date"
                  outlined
                  dense
                  clearable
                  @update:model-value="applyDateFilters"
                >
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn
                  label="Limpiar"
                  icon="clear"
                  outline
                  color="grey-7"
                  size="sm"
                  @click="clearDateFilters"
                  :disable="!dateFilters.from && !dateFilters.to"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Client Summary - Compact -->
      <div class="client-summary-grid">
        <div class="summary-card summary-danger hover-lift">
          <div class="summary-icon gradient-danger">
            <q-icon name="receipt_long" size="24px" color="white" />
          </div>
          <div class="summary-content">
            <div class="summary-label">Total Facturado</div>
            <div class="summary-value text-negative">{{ store.hideAmounts ? '********' : formatCurrency(statement?.summary?.total_owed || 0) }}</div>
          </div>
        </div>

        <div class="summary-card summary-success hover-lift">
          <div class="summary-icon gradient-success">
            <q-icon name="payments" size="24px" color="white" />
          </div>
          <div class="summary-content">
            <div class="summary-label">Total Pagado</div>
            <div class="summary-value text-positive">{{ store.hideAmounts ? '********' : formatCurrency(statement?.summary?.total_paid || 0) }}</div>
          </div>
        </div>

        <div class="summary-card summary-warning hover-lift">
          <div class="summary-icon gradient-warning">
            <q-icon name="account_balance_wallet" size="24px" color="white" />
          </div>
          <div class="summary-content">
            <div class="summary-label">Saldo Actual</div>
            <div class="summary-value text-primary">{{ store.hideAmounts ? '********' : formatCurrency(statement?.summary?.current_balance || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- Transactions Table (Bank Style) -->
      <div class="statement-container">
        <q-card class="modern-card">
          <div class="table-header">
            <div class="table-title">
              <q-icon name="account_balance" size="20px" class="q-mr-xs" />
              <span>Movimientos de Cuenta</span>
            </div>
            <div class="filter-buttons">
              <q-btn
                :unelevated="transactionFilter === 'all'"
                :outline="transactionFilter !== 'all'"
                :color="transactionFilter === 'all' ? 'primary' : 'grey-7'"
                label="Todos"
                icon="list"
                size="sm"
                class="filter-btn"
                @click="transactionFilter = 'all'; filterTransactions()"
              />
              <q-btn
                :unelevated="transactionFilter === 'invoice'"
                :outline="transactionFilter !== 'invoice'"
                :color="transactionFilter === 'invoice' ? 'negative' : 'grey-7'"
                label="Facturas"
                icon="receipt"
                size="sm"
                class="filter-btn"
                @click="transactionFilter = 'invoice'; filterTransactions()"
              />
              <q-btn
                :unelevated="transactionFilter === 'payment'"
                :outline="transactionFilter !== 'payment'"
                :color="transactionFilter === 'payment' ? 'positive' : 'grey-7'"
                label="Pagos"
                icon="payments"
                size="sm"
                class="filter-btn"
                @click="transactionFilter = 'payment'; filterTransactions()"
              />
            </div>
          </div>
          <q-table
            :rows="filteredTransactions"
            :columns="transactionColumns"
            row-key="date"
            :loading="loadingStatement"
            :pagination="statementPagination"
            @request="onStatementRequest"
            @update:pagination="statementPagination = $event"
            flat
            bordered
            class="shadow-2 statement-table"
            :rows-per-page-options="[25, 50, 100]"
            :grid="$q.screen.lt.md"
          >
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6">
                <q-card class="no-shadow transition-all" :class="props.row.type === 'invoice' ? 'bg-red-1' : 'bg-green-1'" style="border-radius: 16px; border: 1px solid #eef0f3">
                  <q-card-section class="row justify-between items-start compact-card-header">
                    <div class="column">
                       <div class="row items-center no-wrap">
                         <q-icon
                           :name="props.row.type === 'invoice' ? 'receipt' : 'payments'"
                           :color="props.row.type === 'invoice' ? 'negative' : 'positive'"
                           size="sm"
                           class="q-mr-sm"
                         />
                         <div class="text-weight-bold text-body1" :class="props.row.type === 'invoice' ? 'text-negative' : 'text-positive'" style="letter-spacing: -0.5px">
                           {{ props.row.description }}
                         </div>
                       </div>
                       <div class="text-caption text-grey-6 text-weight-medium">
                         {{ formatDate(props.row.date) }} {{ formatTime(props.row.date) }}
                       </div>
                    </div>
                    <div class="column items-end">
                       <q-badge
                         :color="props.row.type === 'invoice' ? 'negative' : 'positive'"
                         :label="props.row.type === 'invoice' ? 'Factura' : 'Pago'"
                         class="q-py-xs q-px-sm text-weight-bold shadow-1"
                         rounded
                         style="font-size: 10px; letter-spacing: 0.5px"
                       />
                       <div class="text-caption text-grey-7 q-mt-xs" v-if="props.row.type === 'payment' && props.row.payment?.reference">
                         Ref: {{ props.row.payment.reference }}
                       </div>
                    </div>
                  </q-card-section>

                  <q-separator color="grey-2" inset />

                  <q-card-section class="compact-card-body">
                    <div class="row q-col-gutter-y-sm">
                      <div class="col-6">
                         <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">
                           {{ props.row.type === 'invoice' ? 'Cargo' : 'Abono' }}
                         </div>
                         <div class="text-body1 text-weight-bold" :class="props.row.type === 'invoice' ? 'text-negative' : 'text-positive'">
                           {{ formatCurrency(props.row.debit || props.row.credit) }}
                         </div>
                      </div>
                      <div class="col-6 text-right" v-if="props.row.delivery_date">
                         <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Vencimiento</div>
                         <div class="text-body2 text-grey-8">{{ formatDate(props.row.delivery_date) }}</div>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-section class="compact-card-footer q-pt-none">
                    <div class="row items-center justify-between bg-white q-pa-sm" style="border-radius: 12px; border: 1px solid #eef0f3">
                        <div>
                          <div class="text-caption text-grey-6 text-weight-medium">Saldo</div>
                          <div class="text-h6 text-primary text-weight-bolder lh-100" style="letter-spacing: -0.5px">
                            {{ formatCurrency(props.row.running_balance) }}
                          </div>
                        </div>
                        <div class="row q-gutter-x-xs">
                          <q-btn
                            v-if="props.row.type === 'invoice'"
                            icon="visibility"
                            size="sm"
                            round
                            unelevated
                            color="primary"
                            @click="viewInvoiceDetail(props.row.invoice)"
                          />
                          <q-btn
                            v-if="props.row.type === 'invoice' && Number(props.row.balance) > 0"
                            icon="payment"
                            size="sm"
                            round
                            unelevated
                            color="positive"
                            @click="openInvoicePaymentDialog(props.row.invoice)"
                          />
                          <q-btn
                            v-if="props.row.type === 'payment'"
                            icon="receipt_long"
                            size="sm"
                            round
                            unelevated
                            color="positive"
                            @click="viewPaymentDetail(props.row.payment_id)"
                          />
                          <q-btn
                            v-if="props.row.type === 'payment'"
                            icon="download"
                            size="sm"
                            round
                            unelevated
                            color="primary"
                            @click="downloadPaymentReceiptFromRow(props.row)"
                          />
                          <q-btn
                            v-if="props.row.type === 'payment' && isAdmin"
                            icon="delete"
                            size="sm"
                            round
                            unelevated
                            color="negative"
                            @click="confirmDeletePayment(props.row.payment)"
                          />
                          <!-- Expand Details Button -->
                          <q-btn
                            v-if="(props.row.type === 'invoice' && props.row.invoice.invoice_payments?.length > 0) || (props.row.type === 'payment' && props.row.affected_invoices?.length > 0)"
                            size="sm"
                            unelevated
                            round
                            color="grey-7"
                            :icon="props.row.expanded ? 'expand_less' : 'expand_more'"
                            @click="toggleExpand(props.row)"
                          />
                        </div>
                     </div>

                     <!-- Expanded content for card -->
                     <div v-if="props.row.expanded" class="q-mt-sm fadeIn">
                        <!-- Invoice payments -->
                        <div v-if="props.row.type === 'invoice'" class="bg-white q-pa-sm rounded-borders shadow-1 border-primary">
                           <div class="text-caption text-weight-bold text-positive q-mb-xs">Pagos aplicados:</div>
                           <div v-for="pay in props.row.invoice.invoice_payments" :key="pay.id" class="row justify-between items-center q-py-xs border-bottom-light">
                              <span class="text-caption">{{ pay.payment_method?.name }}</span>
                              <span class="text-caption text-weight-bold text-positive">{{ formatCurrency(pay.amount) }}</span>
                           </div>
                        </div>
                        <!-- Affected invoices by payment -->
                        <div v-if="props.row.type === 'payment'" class="bg-white q-pa-sm rounded-borders shadow-1 border-negative">
                           <div class="text-caption text-weight-bold text-negative q-mb-xs">Facturas afectadas:</div>
                           <div v-for="inv in props.row.affected_invoices" :key="inv.invoice_id" class="row justify-between items-center q-py-xs border-bottom-light">
                              <span class="text-caption">Factura #{{ inv.invoice_id }}</span>
                              <span class="text-caption text-weight-bold text-negative">{{ formatCurrency(inv.amount_applied) }}</span>
                           </div>
                        </div>
                     </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
            <template #header="props">
              <q-tr :props="props" class="bg-primary text-white">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <!-- Row Data Template -->
            <template #body="props">
              <q-tr :props="props" :class="props.row.type === 'invoice' ? 'bg-red-1' : 'bg-green-1'">
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  <template v-if="col.name === 'description'">
                    <div class="row items-center no-wrap">
                      <q-icon
                        :name="props.row.type === 'invoice' ? 'receipt' : 'payments'"
                        :color="props.row.type === 'invoice' ? 'negative' : 'positive'"
                        size="18px"
                        class="q-mr-xs"
                      />
                      <q-btn
                        v-if="(props.row.type === 'invoice' && props.row.invoice.invoice_payments?.length > 0) || (props.row.type === 'payment' && props.row.affected_invoices?.length > 0)"
                        size="xs"
                        flat
                        dense
                        round
                        color="primary"
                        :icon="props.row.expanded ? 'expand_less' : 'expand_more'"
                        @click="toggleExpand(props.row)"
                      >
                        <q-tooltip>
                          {{ props.row.type === 'invoice' ?
                            'Ver pagos de esta factura' :
                            (props.row.is_global_payment ? 'Ver facturas afectadas' : 'Ver factura asociada') }}
                        </q-tooltip>
                      </q-btn>
                      <div class="q-ml-xs">
                        <strong :class="props.row.type === 'invoice' ? 'text-negative' : 'text-positive'" style="font-size: 13px;">
                          {{ col.value }}
                        </strong>
                        <div class="text-caption text-grey-7" style="font-size: 10px;" v-if="props.row.type === 'payment' && props.row.payment?.reference">
                          Ref: {{ props.row.payment.reference }}
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'date'">
                    <div class="text-weight-medium" style="font-size: 12px;">{{ formatDate(props.row.date) }}</div>
                    <div class="text-caption text-grey-7" style="font-size: 10px;">{{ formatTime(props.row.date) }}</div>
                  </template>
                  <template v-else-if="col.name === 'delivery_date'">
                    <div class="text-weight-medium">{{ formatDate(props.row.delivery_date) }}</div>
                    <div class="text-caption text-grey-7">{{ formatTime(props.row.delivery_date) }}</div>
                  </template>
                  <template v-else-if="col.name === 'debit'">
                    <div class="text-right">
                      <span v-if="props.row.debit > 0" class="text-negative text-weight-bold" style="font-size: 14px;">
                        {{ formatCurrency(props.row.debit) }}
                      </span>
                      <span v-else class="text-grey-5" style="font-size: 12px;">-</span>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'credit'">
                    <div class="text-right">
                      <span v-if="props.row.credit > 0" class="text-positive text-weight-bold" style="font-size: 14px;">
                        {{ formatCurrency(props.row.credit) }}
                      </span>
                      <span v-else class="text-grey-5" style="font-size: 12px;">-</span>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'running_balance'">
                    <div class="text-right">
                      <div class="text-weight-bold text-primary" style="font-size: 14px;">
                        {{ formatCurrency(props.row.running_balance) }}
                      </div>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'actions'">
                    <div class="row q-gutter-xs no-wrap justify-center">
                      <!-- Acciones para Facturas -->
                      <q-btn
                        v-if="props.row.type === 'invoice'"
                        icon="visibility"
                        size="xs"
                        round
                        flat
                        color="primary"
                        @click="viewInvoiceDetail(props.row.invoice)"
                      >
                        <q-tooltip>Ver detalle</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="props.row.type === 'invoice' && Number(props.row.balance) > 0"
                        icon="payment"
                        size="xs"
                        round
                        flat
                        color="positive"
                        @click="openInvoicePaymentDialog(props.row.invoice)"
                      >
                        <q-tooltip>Pagar esta factura</q-tooltip>
                      </q-btn>

                      <!-- Acciones para Pagos -->
                      <q-btn
                        v-if="props.row.type === 'payment'"
                        icon="download"
                        size="xs"
                        round
                        flat
                        color="primary"
                        @click="downloadPaymentReceiptFromRow(props.row)"
                      >
                        <q-tooltip>Descargar comprobante</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="props.row.type === 'payment' && isAdmin"
                        icon="delete_forever"
                        size="xs"
                        round
                        flat
                        color="negative"
                        @click="confirmDeletePayment(props.row.payment)"
                      >
                        <q-tooltip>Eliminar pago</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                  <template v-else>
                    {{ col.value }}
                  </template>
                </q-td>
              </q-tr>

              <!-- Expanded row: Invoice payments -->
              <q-tr v-if="props.row.expanded && props.row.type === 'invoice'" :props="props">
                <q-td colspan="100%" class="bg-blue-1">
                  <div class="q-pa-md">
                    <div class="row items-center q-mb-sm">
                      <q-icon name="payments" color="positive" size="md" class="q-mr-sm" />
                      <div class="text-subtitle1 text-weight-bold text-positive">
                        Pagos aplicados a esta factura ({{ props.row.invoice.invoice_payments?.length || 0 }})
                      </div>
                    </div>
                    <q-markup-table dense flat bordered class="shadow-2">
                      <thead class="bg-positive text-white">
                        <tr>
                          <th class="text-left">Fecha</th>
                          <th class="text-left">Hora</th>
                          <th class="text-left">Método de Pago</th>
                          <th class="text-left">Referencia</th>
                          <th class="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="payment in props.row.invoice.invoice_payments" :key="payment.id" class="bg-white">
                          <td class="text-weight-medium">{{ formatDate(payment.created_at) }}</td>
                          <td class="text-grey-7">{{ formatTime(payment.created_at) }}</td>
                          <td>
                            <q-chip dense color="positive" text-color="white" size="sm">
                              {{ payment.payment_method?.name }}
                            </q-chip>
                          </td>
                          <td class="text-grey-7">{{ payment.reference || '-' }}</td>
                          <td class="text-right">
                            <span class="text-positive text-weight-bold" style="font-size: 15px;">
                              {{ formatCurrency(payment.amount) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                </q-td>
              </q-tr>

              <!-- Expanded row: Invoices affected by a payment -->
              <q-tr v-if="props.row.expanded && props.row.type === 'payment' && props.row.affected_invoices" :props="props">
                <q-td colspan="100%" class="bg-primary-1">
                  <div class="q-pa-md">
                    <div class="row items-center q-mb-sm">
                      <q-icon name="receipt_long" color="negative" size="md" class="q-mr-sm" />
                      <div class="text-subtitle1 text-weight-bold text-negative">
                        {{ props.row.is_global_payment ?
                          `Facturas afectadas por este pago (${props.row.affected_invoices.length})` :
                          'Factura asociada a este pago' }}
                      </div>
                    </div>
                    <q-markup-table dense flat bordered class="shadow-2">
                      <thead class="bg-negative text-white">
                        <tr>
                          <th class="text-left">Factura #</th>
                          <th class="text-right">Total Factura</th>
                          <th class="text-right">Monto Aplicado</th>
                          <th class="text-right">Saldo Restante</th>
                          <th class="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="invoice in props.row.affected_invoices" :key="invoice.invoice_id" class="bg-white">
                          <td class="text-weight-bold text-negative">
                            <q-icon name="receipt" size="xs" class="q-mr-xs" />
                            Factura #{{ invoice.invoice_id }}
                          </td>
                          <td class="text-right">{{ formatCurrency(invoice.invoice_total) }}</td>
                          <td class="text-right">
                            <q-chip dense color="positive" text-color="white" size="sm">
                              {{ formatCurrency(invoice.amount_applied) }}
                            </q-chip>
                          </td>
                          <td class="text-right text-primary text-weight-bold">
                            {{ formatCurrency(invoice.invoice_balance) }}
                          </td>
                          <td class="text-center">
                            <q-btn
                              icon="visibility"
                              size="sm"
                              round
                              flat
                              color="primary"
                              @click="viewInvoiceDetail({ id: invoice.invoice_id })"
                            >
                              <q-tooltip>Ver detalle</q-tooltip>
                            </q-btn>
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- DIALOG: REGISTER GLOBAL PAYMENT -->
    <!-- ============================================ -->
    <q-dialog v-model="paymentDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 500px; max-width: 90vw;'}`"
      >
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Registrar Pago</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closePaymentDialog" />
        </q-card-section>

        <q-card-section class="scroll col q-pa-md">
          <div class="text-subtitle2 q-mb-md">
            Saldo pendiente: <strong class="text-negative">{{ formatCurrency(paymentClient?.balance || 0) }}</strong>
          </div>

          <q-input
            v-model.number="paymentForm.amount"
            label="Monto a pagar"
            type="number"
            step="0.01"
            filled
            dense
            :rules="[val => val > 0 || 'Debe ser mayor a 0', val => val <= (paymentClient?.balance || 0) || 'Excede el saldo']"
          />

          <q-select
            v-model="paymentForm.payment_method_id"
            :options="paymentMethods"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Método de pago"
            filled
            dense
            class="q-mt-md"
          />

          <q-input
            v-model="paymentForm.date"
            label="Fecha del pago"
            type="date"
            filled
            dense
            class="q-mt-md"
          />

          <q-input
            v-model="paymentForm.reference"
            label="Referencia (opcional)"
            filled
            dense
            class="q-mt-md"
          />

          <q-banner class="bg-info text-white q-mt-md rounded-borders">
            <template #avatar>
              <q-icon name="info" />
            </template>
            El pago se distribuirá automáticamente en las facturas pendientes, comenzando por las más antiguas (FIFO).
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn label="Cancelar" flat @click="closePaymentDialog" />
          <q-btn
            label="Registrar Pago"
            color="primary"
            unelevated
            :loading="savingPayment"
            :disable="!canRegisterPayment"
            @click="registerGlobalPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================ -->
    <!-- DIALOG: PAYMENT RECEIPT -->
    <!-- ============================================ -->
    <q-dialog v-model="paymentReceiptDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': 'payment-receipt-card'"
        :style="$q.screen.lt.sm ? 'width: 100%;' : ''"
      >
        <q-card-section class="row items-center bg-grey-2 q-py-sm">
          <div class="text-h6 text-positive">
            <q-icon name="check_circle" size="24px" class="q-mr-sm" />
            Pago Registrado
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="receipt-content scroll col">
          <!-- Client Information -->
          <div class="receipt-section">
            <div class="receipt-section-title">Cliente</div>
            <div class="receipt-info">
              <strong>{{ paymentReceipt?.client?.name }}</strong>
              <div class="text-caption text-grey-7">{{ paymentReceipt?.client?.document_number }}</div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="receipt-section">
            <div class="receipt-section-title">Detalles del Pago</div>
            <div class="receipt-details">
              <div class="receipt-row">
                <span class="receipt-label">Monto Total:</span>
                <span class="receipt-value text-positive text-weight-bold">{{ formatCurrency(paymentReceipt?.total_amount || 0) }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Fecha:</span>
                <span class="receipt-value">{{ paymentReceipt?.payment?.date || formatDate(paymentReceipt?.payment?.created_at) }}</span>
              </div>
              <div class="receipt-row" v-if="paymentReceipt?.payment?.reference">
                <span class="receipt-label">Referencia:</span>
                <span class="receipt-value">{{ paymentReceipt?.payment?.reference }}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Método de Pago:</span>
                <span class="receipt-value">{{ paymentReceipt?.payment?.payment_method?.name || getPaymentMethodName(paymentReceipt?.payment?.payment_method_id) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Distribution -->
          <div class="receipt-section">
            <div class="receipt-section-title">
              Distribución del Pago
              <q-badge color="primary" :label="paymentReceipt?.distributed_payments?.length || 0" />
            </div>
            <q-list bordered class="receipt-list">
              <q-item
                v-for="(dist, index) in paymentReceipt?.distributed_payments"
                :key="index"
                class="receipt-list-item"
              >
                <q-item-section avatar>
                  <q-icon name="receipt" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Factura #{{ dist.invoice_id }}</q-item-label>
                  <q-item-label caption>Aplicado al saldo</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-positive text-weight-bold">
                    {{ formatCurrency(dist.amount) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary bg-grey-1">
          <q-btn
            label="Descargar"
            icon="download"
            color="primary"
            unelevated
            @click="downloadPaymentReceipt"
            no-caps
          />
          <q-btn
            label="Cerrar"
            flat
            color="grey-7"
            v-close-popup
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================ -->
    <!-- DIALOG: INVOICE DETAIL -->
    <!-- ============================================ -->
    <q-dialog v-model="invoiceDetailDialog" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': 'invoice-detail-card'"
        :style="$q.screen.lt.sm ? 'width: 100%;' : ''"
      >
        <div class="column full-height">
          <!-- Header -->
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Factura #{{ selectedInvoice?.id }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup color="white" />
          </q-card-section>

          <q-separator />

          <q-card-section class="scroll col q-pa-md" v-if="selectedInvoice">
            <!-- General Information and Totals -->
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Client and Dates -->
              <div class="col-12 col-md-6">
                <div class="detail-card">
                  <div class="detail-card-title">
                    <q-icon name="person" size="18px" />
                    Información General
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Cliente:</span>
                    <span class="detail-value text-weight-bold">{{ selectedInvoice.client?.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Fecha:</span>
                    <span class="detail-value">{{ formatDateTime(selectedInvoice.created_at) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Vencimiento:</span>
                    <span class="detail-value">{{ formatDateTime(selectedInvoice.delivery_date) }}</span>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="col-12 col-md-6">
                <div class="detail-card totals-card">
                  <div class="detail-card-title">
                    <q-icon name="calculate" size="18px" />
                    Totales
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value text-weight-bold">{{ formatCurrency(invoiceDetail?.totals?.total || 0) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Pagado:</span>
                    <span class="detail-value text-positive text-weight-bold">{{ formatCurrency(invoiceDetail?.totals?.paid || 0) }}</span>
                  </div>
                  <div class="detail-row balance-row">
                    <span class="detail-label">Saldo:</span>
                    <span class="detail-value text-negative text-weight-bold" style="font-size: 18px;">{{ formatCurrency(invoiceDetail?.totals?.balance || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products -->
            <div class="detail-section">
              <div class="detail-section-title">
                <q-icon name="inventory_2" size="20px" />
                Productos
                <q-badge color="primary" :label="selectedInvoice.products?.length || 0" />
              </div>
              <div class="products-table overflow-auto">
                <!-- Desktop/Tablet view -->
                <table class="modern-table gt-xs full-width">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-right">Precio</th>
                      <th class="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in (selectedInvoice.products || [])" :key="product.id">
                      <td>{{ product.name }}</td>
                      <td class="text-center">{{ formatNumber(product.pivot.amount) }}</td>
                      <td class="text-right">{{ formatCurrency(product.pivot.price) }}</td>
                      <td class="text-right text-weight-bold">{{ formatCurrency(product.pivot.amount * product.pivot.price) }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Mobile view -->
                <div class="lt-sm q-gutter-y-sm">
                  <div v-for="product in (selectedInvoice.products || [])" :key="product.id" class="q-pa-sm bg-grey-1 rounded-borders">
                    <div class="text-weight-bold text-body2">{{ product.name }}</div>
                    <div class="row justify-between items-center q-mt-xs">
                      <span class="text-caption text-grey-7">{{ formatNumber(product.pivot.amount) }} x {{ formatCurrency(product.pivot.price) }}</span>
                      <span class="text-weight-bold text-primary">{{ formatCurrency(product.pivot.amount * product.pivot.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Applied Payments -->
            <div class="detail-section q-mt-lg" v-if="selectedInvoice.invoice_payments?.length > 0">
              <div class="detail-section-title">
                <q-icon name="payments" size="20px" />
                Pagos Aplicados
                <q-badge color="positive" :label="selectedInvoice.invoice_payments?.length || 0" />
              </div>
              <div class="products-table">
                <table class="modern-table full-width">
                  <thead>
                    <tr>
                      <th>Método</th>
                      <th class="gt-xs">Fecha</th>
                      <th class="text-right">Monto</th>
                      <th class="text-center">Acc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in selectedInvoice.invoice_payments" :key="payment.id">
                      <td>
                        <div class="row items-center no-wrap">
                          <q-icon name="check_circle" color="positive" size="18px" class="q-mr-sm gt-xs" />
                          <span class="text-caption text-weight-medium">{{ payment.payment_method?.name }}</span>
                        </div>
                        <div class="lt-sm text-caption text-grey-6">{{ formatDate(payment.created_at) }}</div>
                      </td>
                      <td class="gt-xs text-caption">{{ formatDateTime(payment.created_at) }}</td>
                      <td class="text-right text-weight-bold text-positive text-caption">{{ formatCurrency(payment.amount) }}</td>
                      <td class="text-center">
                        <q-btn
                          icon="delete"
                          size="xs"
                          round
                          unelevated
                          color="negative"
                          @click="confirmDeletePayment(payment)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Actions -->
          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn
              label="Cerrar"
              color="negative"
              flat
              v-close-popup
              no-caps
            />
          </q-card-actions>
        </div>
      </q-card>
    </q-dialog>

    <!-- ============================================ -->
    <!-- DIALOG: DETALLE DE PAGO -->
    <!-- ============================================ -->
    <q-dialog v-model="paymentDetailDialog" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': 'payment-detail-card'"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'min-width: 500px; max-width: 700px;'"
      >
        <!-- Header -->
        <q-card-section class="row items-center bg-positive text-white q-py-sm">
          <div class="text-h6">Detalle del Pago</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll col q-pa-md" v-if="paymentDetail">
          <!-- Payment Info -->
          <div class="bg-green-1 q-pa-md rounded-borders border-positive q-mb-md">
            <div class="text-h5 text-positive text-weight-bolder q-mb-xs">
              {{ formatCurrency(paymentDetail.total_amount) }}
            </div>
            <div class="row q-col-gutter-sm text-caption text-grey-8">
              <div class="col-12 col-sm-6">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                {{ formatDateTime(paymentDetail.payment.date) }}
              </div>
              <div class="col-12 col-sm-6" v-if="paymentDetail.payment.reference">
                <q-icon name="tag" size="16px" class="q-mr-xs" />
                Ref: {{ paymentDetail.payment.reference }}
              </div>
              <div class="col-12 col-sm-6">
                <q-icon name="payment" size="16px" class="q-mr-xs" />
                {{ paymentDetail.payment.payment_method?.name }}
              </div>
            </div>
            <q-badge v-if="paymentDetail.is_global_payment" color="info" class="q-mt-sm">
              Pago Global ({{ paymentDetail.affected_invoices.length }} facturas)
            </q-badge>
          </div>

          <!-- Affected Invoices -->
          <div class="text-subtitle2 q-mb-sm text-grey-8">Facturas Pagadas:</div>
          <q-list bordered separator class="rounded-borders overflow-hidden shadow-1">
            <q-item v-for="invoice in paymentDetail.affected_invoices" :key="invoice.invoice_id" class="bg-white">
              <q-item-section avatar>
                <q-icon name="receipt" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Factura #{{ invoice.invoice_id }}</q-item-label>
                <q-item-label caption>
                  Total: {{ formatCurrency(invoice.invoice_total) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-positive text-weight-bold" style="font-size: 1rem">
                  {{ formatCurrency(invoice.amount_applied) }}
                </q-item-label>
                <q-item-label caption>
                  Saldo: {{ formatCurrency(invoice.invoice_balance) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary bg-grey-1">
          <q-btn label="Cerrar" color="primary" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================ -->
    <!-- DIALOG: FILTROS (MODERN DRAWER) -->
    <!-- ============================================ -->
    <q-dialog v-model="filterDialog" position="right" full-height>
      <q-card style="width: 450px; max-width: 90vw;" class="column full-height">
        <q-card-section class="row items-center q-pb-md text-white bg-primary">
          <div class="text-h6">Filtros Avanzados</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-scroll-area class="col">
          <q-card-section class="q-gutter-y-md">
            <!-- Section: Search Info -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Información del Cliente</div>
              <q-input
                v-model="filters.client_search"
                placeholder="Nombre o documento..."
                filled
                dense
                clearable
              >
                <template v-slot:prepend><q-icon name="search" size="xs" /></template>
              </q-input>
            </div>

            <!-- Section: Branch & Status -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Sucursal y Estado</div>
              <div class="column q-gutter-y-sm">
                <q-select
                  v-model="selectedBranchOffice"
                  :options="availableBranchOffices"
                  option-value="id"
                  option-label="name"
                  filled
                  dense
                  clearable
                  emit-value
                  map-options
                  label="Seleccionar Sucursal"
                >
                  <template v-slot:prepend><q-icon name="store" size="xs" /></template>
                </q-select>

                <div class="status-buttons row no-wrap q-gutter-x-xs">
                  <q-btn
                    :unelevated="filters.balance_status === 'all'"
                    :outline="filters.balance_status !== 'all'"
                    :color="filters.balance_status === 'all' ? 'primary' : 'grey-7'"
                    label="Todos"
                    size="sm"
                    class="col"
                    @click="filters.balance_status = 'all'"
                  />
                  <q-btn
                    :unelevated="filters.balance_status === 'with_debt'"
                    :outline="filters.balance_status !== 'with_debt'"
                    :color="filters.balance_status === 'with_debt' ? 'negative' : 'grey-7'"
                    label="Con saldo"
                    size="sm"
                    class="col"
                    @click="filters.balance_status = 'with_debt'"
                  />
                  <q-btn
                    :unelevated="filters.balance_status === 'no_debt'"
                    :outline="filters.balance_status !== 'no_debt'"
                    :color="filters.balance_status === 'no_debt' ? 'positive' : 'grey-7'"
                    label="En cero"
                    size="sm"
                    class="col"
                    @click="filters.balance_status = 'no_debt'"
                  />
                </div>
              </div>
            </div>

            <!-- Section: Partner Mode & Specific Partner -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Modo y Afiliados</div>
              <div class="column q-gutter-y-sm">
                <q-btn-toggle
                  v-model="filters.onlyClients"
                  toggle-color="primary"
                  flat
                  stretch
                  class="full-width no-shadow border-grey"
                  :options="[
                    { label: 'Empresa', value: true },
                    { label: 'Afiliados', value: false }
                  ]"
                />
                <q-select
                  v-model="selectedPartnerFilter"
                  :options="partners"
                  option-value="id"
                  option-label="name"
                  filled
                  dense
                  clearable
                  use-input
                  label="Filtrar por Afiliado"
                  @filter="getPartners"
                  @update:model-value="applyPartnerFilter"
                >
                  <template v-slot:prepend><q-icon name="group" size="xs" /></template>
                </q-select>

                <q-toggle
                  v-model="filters.is_partner"
                  label="Mostrar solo Socios/Afiliados"
                  color="primary"
                  class="full-width q-px-sm border-grey"
                  :true-value="1"
                  :false-value="null"
                  @update:model-value="applyFilters"
                />
              </div>
            </div>

            <!-- Section: Date Range -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Rango de Fechas</div>
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.date_from"
                    type="date"
                    filled
                    dense
                    label="Desde"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="filters.date_to"
                    type="date"
                    filled
                    dense
                    label="Hasta"
                  />
                </div>
              </div>
            </div>

            <!-- Section: Minimum Balance -->
            <div class="filter-item">
              <div class="text-subtitle2 q-mb-xs">Saldo Mínimo</div>
              <q-input
                v-model.number="filters.min_balance"
                type="number"
                placeholder="0.00"
                filled
                dense
                clearable
              >
                <template v-slot:prepend><q-icon name="attach_money" size="xs" /></template>
              </q-input>
            </div>
          </q-card-section>
        </q-scroll-area>

        <q-separator />

        <q-card-actions align="between" class="q-pa-md">
          <q-btn flat label="Limpiar Filtros" color="negative" @click="clearFilters" />
          <q-btn unelevated label="Aplicar Filtros" color="primary" @click="applyFilters" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============================================ -->
    <!-- DIALOG: SPECIFIC INVOICE PAYMENT -->
    <!-- ============================================ -->
    <q-dialog v-model="invoicePaymentDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 500px; max-width: 90vw;'}`"
      >
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-h6">Pagar Factura #{{ invoicePaymentData?.id }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeInvoicePaymentDialog" />
        </q-card-section>

        <q-card-section class="scroll col q-pa-md">
          <div class="text-subtitle2 q-mb-md">
            Saldo pendiente: <strong class="text-negative">{{ formatNumber(invoicePaymentData?.balance || 0) }}</strong>
          </div>

          <q-input
            v-model.number="invoicePaymentForm.amount"
            label="Monto a pagar"
            type="number"
            step="0.01"
            filled
            dense
            :rules="[
              val => val > 0 || 'Debe ser mayor a 0',
              val => val <= (invoicePaymentData?.balance || 0) || 'Excede el saldo'
            ]"
          />

          <q-select
            v-model="invoicePaymentForm.payment_method_id"
            :options="paymentMethods"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Método de pago"
            filled
            dense
            class="q-mt-md"
          />

          <q-input
            v-model="invoicePaymentForm.date"
            label="Fecha del pago"
            type="date"
            filled
            dense
            class="q-mt-md"
          />

          <q-input
            v-model="invoicePaymentForm.reference"
            label="Referencia (opcional)"
            filled
            dense
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary bg-grey-1">
          <q-btn label="Cancelar" flat @click="closeInvoicePaymentDialog" />
          <q-btn
            label="Registrar Pago"
            color="primary"
            unelevated
            :loading="savingInvoicePayment"
            :disable="!canRegisterInvoicePayment"
            @click="registerInvoicePayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { formatNumber, notify, loading } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

export default {
  name: 'AccountsReceivablePage',

  data () {
    return {
      formatNumber,
      store: authentication(),

      /**
       * Selected client to view their account statement
       * @type {Object|null}
       */
      selectedClient: null,

      /**
       * Account statement data for the selected client
       * @type {Object|null}
       */
      statement: null,

      // ============================================
      // CLIENTS LIST
      // ============================================

      /**
       * List of loaded clients
       * @type {Array<Object>}
       */
      clients: [],

      /**
       * Indicates if data is being loaded
       * @type {Boolean}
       */
      loading: false,

      /**
       * Client search text
       * @type {String}
       */
      search: '',

      /**
       * Pagination configuration for clients table
       * @type {Object}
       */
      pagination: {
        sortBy: 'balance',
        descending: true,
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 0
      },

      // ============================================
      // GLOBAL KPIs
      // ============================================

      /**
       * Global key performance indicators
       * @type {Object}
       */
      globalKpis: {
        total_owed: 0,
        total_paid: 0,
        balance: 0,
        client_count: 0
      },

      // ============================================
      // ACCOUNT STATEMENT
      // ============================================

      /**
       * Indicates if account statement is being loaded
       * @type {Boolean}
       */
      loadingStatement: false,

      /**
       * Active filter for transaction type ('all', 'invoice', 'payment')
       * @type {String}
       */
      transactionFilter: 'all',

      /**
       * Filtered transactions to display in table
       * @type {Array<Object>}
       */
      filteredTransactions: [],

      /**
       * Pagination for statement transactions
       * @type {Object}
       */
      statementPagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 0
      },

      // ============================================
      // FILTERS
      // ============================================

      /**
       * Controls visibility of filters dialog
       * @type {Boolean}
       */
      filterDialog: false,

      /**
       * Currently selected branch office ID
       * @type {Number|null}
       */
      selectedBranchOffice: null,

      /**
       * List of branch offices available to the userSession
       * @type {Array<Object>}
       */
      availableBranchOffices: [],

      /**
       * List of partners available for filtering
       * @type {Array<Object>}
       */
      partners: [],

      /**
       * Selected partner object from the filter
       * @type {Object|null}
       */
      selectedPartnerFilter: null,

      /**
       * Filters applied to client search
       * @type {Object}
       */
      filters: {
        client_search: '',
        date_from: '',
        date_to: '',
        min_balance: null,
        balance_status: 'all', // all, with_debt, no_debt
        onlyClients: true,
        partner_id: null,
        is_partner: null
      },

      /**
       * Date filters for client statement detail
       * @type {Object}
       */
      dateFilters: {
        from: '',
        to: ''
      },

      // ============================================
      // GLOBAL PAYMENT DIALOG
      // ============================================

      /**
       * Controls visibility of global payment dialog
       * @type {Boolean}
       */
      paymentDialog: false,

      /**
       * Client receiving the global payment
       * @type {Object|null}
       */
      paymentClient: null,

      /**
       * Global payment form data
       * @type {Object}
       */
      paymentForm: {
        amount: 0,
        payment_method_id: null,
        date: (() => {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, '0')
          const day = String(today.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })(),
        reference: ''
      },

      /**
       * List of available payment methods
       * @type {Array<Object>}
       */
      paymentMethods: [],

      /**
       * Indicates if a global payment is being saved
       * @type {Boolean}
       */
      savingPayment: false,

      // ============================================
      // INVOICE PAYMENT DIALOG
      // ============================================

      /**
       * Controls visibility of invoice payment dialog
       * @type {Boolean}
       */
      invoicePaymentDialog: false,

      /**
       * Invoice data for payment registration
       * @type {Object|null}
       */
      invoicePaymentData: null,

      /**
       * Invoice payment form data
       * @type {Object}
       */
      invoicePaymentForm: {
        amount: 0,
        payment_method_id: null,
        date: (() => {
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, '0')
          const day = String(today.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        })(),
        reference: ''
      },

      /**
       * Indicates if an invoice payment is being saved
       * @type {Boolean}
       */
      savingInvoicePayment: false,

      // ============================================
      // PAYMENT RECEIPT DIALOG
      // ============================================

      /**
       * Controls visibility of payment receipt dialog
       * @type {Boolean}
       */
      paymentReceiptDialog: false,

      /**
       * Payment receipt data to display
       * @type {Object|null}
       */
      paymentReceipt: null,

      // ============================================
      // INVOICE DETAIL DIALOG
      // ============================================

      /**
       * Controls visibility of invoice detail dialog
       * @type {Boolean}
       */
      invoiceDetailDialog: false,

      /**
       * Selected invoice to view details
       * @type {Object|null}
       */
      selectedInvoice: null,

      /**
       * Complete invoice detail data
       * @type {Object|null}
       */
      invoiceDetail: null,

      // ============================================
      // PAYMENT DETAIL DIALOG
      // ============================================

      /**
       * Controls visibility of payment detail dialog
       * @type {Boolean}
       */
      paymentDetailDialog: false,

      /**
       * Payment detail data
       * @type {Object|null}
       */
      paymentDetail: null,

      // ============================================
      // TABLE COLUMNS
      // ============================================

      /**
       * Column definitions for clients table
       * @type {Array<Object>}
       */
      clientColumns: [
        { name: 'document_number', align: 'left', label: 'Documento', field: 'document_number', sortable: true },
        { name: 'name', align: 'left', label: 'Cliente', field: 'name', sortable: true },
        { name: 'invoice_count', align: 'center', label: 'Facturas', field: 'invoice_count', sortable: true },
        { name: 'total_owed', align: 'right', label: 'Total Facturado', field: 'total_owed', sortable: true },
        { name: 'total_paid', align: 'right', label: 'Total Pagado', field: 'total_paid', sortable: true },
        { name: 'balance', align: 'right', label: 'Saldo', field: 'balance', sortable: true },
        { name: 'actions', align: 'center', label: 'Acciones', field: 'actions' }
      ],

      /**
       * Column definitions for transactions table
       * @type {Array<Object>}
       */
      transactionColumns: [
        { name: 'date', align: 'left', label: 'Fecha', field: 'date' },
        { name: 'delivery_date', align: 'left', label: 'Fecha Entrega', field: 'delivery_date' },
        { name: 'description', align: 'left', label: 'Descripción', field: 'description' },
        { name: 'debit', align: 'right', label: 'Cargo', field: 'debit' },
        { name: 'credit', align: 'right', label: 'Abono', field: 'credit' },
        { name: 'running_balance', align: 'right', label: 'Saldo', field: 'running_balance' },
        { name: 'actions', align: 'center', label: '', field: 'actions' }
      ]
    }
  },

  computed: {
    ...mapState(authentication, ['branchOffice', 'userSession']),

    /**
     * Validates if a global payment can be registered
     * Checks that amount is valid, doesn't exceed balance, and has method and date
     * @returns {Boolean} True if payment can be registered
     */
    canRegisterPayment () {
      return this.paymentForm.amount > 0 &&
             this.paymentForm.amount <= (this.paymentClient?.balance || 0) &&
             this.paymentForm.payment_method_id &&
             this.paymentForm.date
    },

    /**
     * Validates if an invoice payment can be registered
     * Checks that amount is valid, doesn't exceed balance, and has method and date
     * @returns {Boolean} True if payment can be registered
     */
    canRegisterInvoicePayment () {
      return this.invoicePaymentForm.amount > 0 &&
             this.invoicePaymentForm.amount <= (this.invoicePaymentData?.balance || 0) &&
             this.invoicePaymentForm.payment_method_id &&
             this.invoicePaymentForm.date
    },

    /**
     * Checks if the current user is an administrator
     * @returns {Boolean} True if user is root or super admin
     */
    isAdmin () {
      return this.userSession?.is_root || this.userSession?.is_super_admin
    },

    /**
     * Calculates the number of active filters
     * @returns {Number} Count of active filters
     */
    activeFiltersCount () {
      let count = 0
      if (this.filters.client_search) count++
      if (this.filters.date_from) count++
      if (this.filters.date_to) count++
      if (this.filters.min_balance) count++
      if (this.filters.balance_status !== 'all') count++
      if (this.filters.onlyClients === false) count++
      if (this.filters.partner_id) count++
      if (this.filters.is_partner) count++
      return count
    }
  },

  watch: {
    branchOffice () {
      this.loadClients()
    }
  },

  mounted () {
    this.loadBranchOffices()
    this.loadClients()
    this.getPaymentMethods()
  },

  methods: {
    /**
     * Gets today's date in YYYY-MM-DD format without timezone issues
     * @returns {String} Today's date in local timezone
     */
    getTodayDate () {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    async togglePartnerMode () {
      await this.store.togglePartnerMode()
      this.filters.onlyClients = !this.store.partnerMode
      this.loadClients()
    },

    /**
     * Loads available branch offices based on userSession role
     * If root/superadmin: shows all branch offices
     * If not: shows only assigned branch offices using dataEqualFilter
     */
    async loadBranchOffices () {
      try {
        const params = {}

        // Si NO es root ni superadmin, filtrar por sucursales asignadas
        if (!this.userSession?.is_root && !this.userSession?.is_superadmin) {
          params.dataEqualFilter = {
            'branchOfficeUsers.user_id': this.userSession.id
          }
        }

        const { data } = await this.$api.get('branch-offices', { params })

        // Si es root o superadmin, agregar opción "Todas las sucursales"
        if (this.userSession?.is_root || this.userSession?.is_superadmin) {
          this.availableBranchOffices = [
            { id: null, name: 'Todas las sucursales' },
            ...data
          ]
        } else {
          // Para usuarios normales, mostrar solo sus sucursales asignadas
          if (data && data.length > 0) {
            this.availableBranchOffices = data
          } else {
            // Si no tiene sucursales asignadas, usar la sucursal actual
            if (this.branchOffice) {
              this.availableBranchOffices = [this.branchOffice]
            } else {
              this.availableBranchOffices = []
            }
          }
        }

        // Set default selected branch office
        this.selectedBranchOffice = this.branchOffice?.id || null
      } catch (error) {
        console.error('Error loading branch offices:', error)
        // En caso de error, usar solo la sucursal actual del usuario
        if (this.branchOffice) {
          this.availableBranchOffices = [this.branchOffice]
          this.selectedBranchOffice = this.branchOffice.id
        }
        notify('Error al cargar las sucursales', 'negative', 'warning')
      }
    },

    /**
     * Handles table request events (pagination, sorting, filtering)
     * @param {Object} props - Request properties from q-table
     */
    async onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      try {
        this.loading = true

        const params = {
          page,
          perPage: rowsPerPage,
          sortBy: sortBy || 'balance',
          sortOrder: descending ? 'desc' : 'asc',
          branch_office_id: this.selectedBranchOffice || this.branchOffice?.id,
          search: this.search,
          ...this.filters
        }

        const { data } = await this.$api.get('client-statement/clients', { params })

        this.clients = data.data || []

        // Update pagination
        this.pagination.page = page
        this.pagination.rowsPerPage = rowsPerPage
        this.pagination.sortBy = sortBy
        this.pagination.descending = descending
        this.pagination.rowsNumber = data.total || 0

        // Calculate global KPIs from server response if available
        if (data.kpis) {
          this.globalKpis = data.kpis
        } else {
          // Fallback: calculate from current page data
          this.globalKpis = {
            total_owed: this.clients.reduce((sum, c) => sum + (c.total_owed || 0), 0),
            total_paid: this.clients.reduce((sum, c) => sum + (c.total_paid || 0), 0),
            balance: this.clients.reduce((sum, c) => sum + (c.balance || 0), 0),
            client_count: data.total || this.clients.length
          }
        }
      } catch (error) {
        notify(error.message || 'Error al cargar clientes', 'negative', 'warning')
      } finally {
        this.loading = false
      }
    },

    /**
     * Loads the list of clients with pending balance
     * Wrapper method for initial load and filter changes
     */
    async loadClients () {
      if (this.userSession?.is_partner) {
        this.store.partnerMode = true
        this.filters.onlyClients = false
      } else if (this.store.partnerMode) {
        this.filters.onlyClients = false
      } else {
        this.filters.onlyClients = true
      }
      await this.onRequest({ pagination: this.pagination })
    },

    /**
     * Resets pagination and reloads clients
     */
    searchClients () {
      this.pagination.page = 1
      this.loadClients()
    },

    /**
     * Resets all filters to their default values
     */
    clearFilters () {
      this.filters = {
        client_search: '',
        date_from: '',
        date_to: '',
        min_balance: null,
        balance_status: 'all',
        onlyClients: true,
        partner_id: null,
        is_partner: null
      }
      this.selectedPartnerFilter = null
      this.search = ''
      this.pagination.page = 1
      this.loadClients()
      this.filterDialog = false
    },

    /**
     * Applies the current filters and reloads the client list
     */
    applyFilters () {
      this.filterDialog = false
      this.pagination.page = 1
      this.loadClients()
    },

    /**
     * Fetches partners list from the API with optional search filtering
     * @param {String} value - Search value for name or document
     * @param {Function} update - Callback to update the options in q-select
     */
    async getPartners (value, update) {
      try {
        const { data } = await this.$api.get('partners', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            },
            paginate: true,
            page: 1,
            perPage: 20,
            sortBy: 'id',
            sortOrder: 'desc'
          }
        })
        update(() => {
          this.partners = data.data
        })
      } catch (err) {
        notify('Error en la conexión con afiliados', 'negative', 'warning')
      }
    },

    /**
     * Handles specific partner selection in the filter
     * Automatically sets mode to partner clients if a partner is chosen
     * @param {Object|null} val - Selected partner object
     */
    applyPartnerFilter (val) {
      if (val) {
        this.filters.partner_id = val.id
        // When filtering by a specific partner, we want to see THEIR clients
        this.filters.onlyClients = false
      } else {
        this.filters.partner_id = null
      }
      this.applyFilters()
    },

    /**
     * Handles statement table request events (pagination, sorting)
     * @param {Object} props - Request properties from q-table
     */
    async onStatementRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      try {
        this.loadingStatement = true

        const params = {
          page,
          perPage: rowsPerPage,
          sortBy: sortBy || 'date',
          sortOrder: descending ? 'desc' : 'asc',
          branch_office_id: this.selectedBranchOffice || this.branchOffice?.id,
          transaction_type: this.transactionFilter !== 'all' ? this.transactionFilter : null,
          date_from: this.dateFilters.from || null,
          date_to: this.dateFilters.to || null
        }

        const { data } = await this.$api.get(`client-statement/clients/${this.selectedClient.id}`, { params })

        // Add expanded property to each transaction
        if (data.transactions) {
          data.transactions.forEach(t => {
            t.expanded = false
          })
          this.filteredTransactions = data.transactions
        }

        // Update pagination
        this.statementPagination.page = page
        this.statementPagination.rowsPerPage = rowsPerPage
        this.statementPagination.sortBy = sortBy
        this.statementPagination.descending = descending
        this.statementPagination.rowsNumber = data.total || 0

        // Update summary if available
        if (data.summary) {
          this.statement = data
        }
      } catch (error) {
        notify(error.message || 'Error al cargar transacciones', 'negative', 'warning')
      } finally {
        this.loadingStatement = false
      }
    },

    /**
     * Displays the detailed account statement for a client
     * Loads all transactions (invoices and payments) for the client
     * @param {Event} event - Click event
     * @param {Object} client - Selected client object
     */
    async viewClientStatement (event, client) {
      try {
        this.selectedClient = client
        this.transactionFilter = 'all'

        // Reset date filters
        this.dateFilters = {
          from: '',
          to: ''
        }

        // Reset pagination
        this.statementPagination = {
          sortBy: 'date',
          descending: true,
          page: 1,
          rowsPerPage: 25,
          rowsNumber: 0
        }

        // Load first page
        await this.onStatementRequest({ pagination: this.statementPagination })
      } catch (error) {
        notify(error.message || 'Error al cargar estado de cuenta', 'negative', 'warning')
      }
    },

    /**
     * Applies date filters to the client statement
     * Resets pagination and reloads data
     */
    async applyDateFilters () {
      if (!this.selectedClient) return

      // Reset to first page when applying filters
      this.statementPagination.page = 1

      // Reload data with new filters
      await this.onStatementRequest({ pagination: this.statementPagination })
    },

    /**
     * Clears date filters and reloads data
     */
    async clearDateFilters () {
      this.dateFilters = {
        from: '',
        to: ''
      }

      // Reset to first page
      this.statementPagination.page = 1

      // Reload data without filters
      await this.onStatementRequest({ pagination: this.statementPagination })
    },

    /**
     * Returns to the clients list view
     * Clears selected client and reloads the list
     */
    backToClients () {
      this.selectedClient = null
      this.statement = null
      this.loadClients()
    },

    /**
     * Expands or collapses a transaction row to show details
     * @param {Object} row - Table row to expand/collapse
     */
    toggleExpand (row) {
      row.expanded = !row.expanded
      this.$forceUpdate()
    },

    /**
     * Opens the dialog to register a global payment for the client
     * Initializes the form with the client's total balance
     * @param {Object} client - Client to receive the payment
     */
    openGlobalPaymentDialog (client) {
      // Use statement's balance if viewing the statement, else use client's balance
      const balance = this.selectedClient && this.statement?.summary
        ? this.statement.summary.current_balance
        : client.balance

      // Assign to paymentClient but update its balance to the computed one
      this.paymentClient = { ...client, balance }

      this.paymentForm = {
        amount: balance,
        payment_method_id: this.paymentMethods[0]?.id || null,
        date: this.getTodayDate(),
        reference: ''
      }
      this.paymentDialog = true
    },

    /**
     * Closes the global payment dialog
     * Clears the form and selected client
     */
    closePaymentDialog () {
      this.paymentDialog = false
      this.paymentClient = null
    },

    /**
     * Registers a global payment that is automatically distributed
     * among the client's pending invoices (FIFO)
     * Shows a receipt with the payment distribution
     */
    async registerGlobalPayment () {
      try {
        this.savingPayment = true

        const { data } = await this.$api.post(`client-statement/clients/${this.paymentClient.id}/payments`, {
          ...this.paymentForm,
          branch_office_id: this.selectedBranchOffice || this.branchOffice?.id,
          date_from: this.dateFilters?.from || null,
          date_to: this.dateFilters?.to || null
        })

        notify('Pago registrado y distribuido exitosamente', 'positive', 'check_circle')

        // Save client reference before closing dialog
        const clientId = this.paymentClient.id

        // Save payment data for receipt
        this.paymentReceipt = {
          payment: data.payment,
          distributed_payments: data.distributed_payments,
          client: this.paymentClient,
          total_amount: this.paymentForm.amount
        }

        this.closePaymentDialog()

        // Show confirmation dialog AFTER closing payment dialog
        setTimeout(() => {
          this.paymentReceiptDialog = true
        }, 300)

        // Refresh data without changing view
        if (this.selectedClient) {
          // If viewing client detail, reload their account statement
          const { data: updatedStatement } = await this.$api.get(`client-statement/clients/${clientId}`, {
            params: {
              branch_office_id: this.selectedBranchOffice || this.branchOffice?.id
            }
          })

          // Add expanded property to each transaction
          updatedStatement.transactions.forEach(t => {
            t.expanded = false
          })

          this.statement = updatedStatement
          this.filteredTransactions = updatedStatement.transactions
          this.transactionFilter = 'all'

          // Update selected client balance to correctly reflect the new statement
          if (updatedStatement.summary) {
            this.selectedClient.balance = updatedStatement.summary.current_balance
            this.selectedClient.total_owed = updatedStatement.summary.total_owed
            this.selectedClient.total_paid = updatedStatement.summary.total_paid
          }
        } else {
          // If in list view, just reload the list
          this.loadClients()
        }
      } catch (error) {
        notify(error.response?.data?.error || 'Error al registrar pago', 'negative', 'warning')
      } finally {
        this.savingPayment = false
      }
    },

    /**
     * Gets the payment method name by its ID
     * @param {Number} paymentMethodId - Payment method ID
     * @returns {String} Payment method name or '-'
     */
    getPaymentMethodName (paymentMethodId) {
      if (!paymentMethodId) return '-'
      const method = this.paymentMethods.find(m => m.id === paymentMethodId)
      return method?.name || '-'
    },

    /**
     * Downloads payment receipt from a table row
     * Builds the receipt object and generates printable PDF
     * @param {Object} row - Payment row from table
     */
    async downloadPaymentReceiptFromRow (row) {
      try {
        loading(true)

        // Build receipt object from row
        const payment = row.payment
        const affectedInvoices = row.affected_invoices || []

        // Create receipt structure
        const receipt = {
          payment,
          distributed_payments: affectedInvoices.map(inv => ({
            invoice_id: inv.id,
            amount: inv.pivot?.amount || 0
          })),
          client: this.selectedClient,
          total_amount: row.credit || 0
        }

        // Generate receipt
        await this.generatePrintableReceipt(receipt)

        notify('Comprobante generado', 'positive', 'check')
      } catch (error) {
        console.error('Error al generar comprobante:', error)
        notify('Error al generar comprobante', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Downloads the current payment receipt
     * Uses data stored in paymentReceipt
     */
    async downloadPaymentReceipt () {
      await this.generatePrintableReceipt(this.paymentReceipt)
    },

    /**
     * Generates a printable payment receipt in HTML
     * Opens a new window with the formatted receipt
     * @param {Object} receiptData - Receipt data to generate
     */
    async generatePrintableReceipt (receiptData) {
      try {
        loading(true)

        // For now, generate a simple report with available data
        // TODO: Implement backend endpoint to generate professional PDF
        notify('Generando comprobante...', 'info', 'info')

        // Create HTML content for printing
        const printWindow = window.open('', '_blank')
        const paymentId = receiptData.payment?.id || 'N/A'
        const paymentDate = receiptData.payment?.date || this.formatDate(receiptData.payment?.created_at) || new Date().toLocaleDateString()

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Comprobante de Pago #${paymentId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .section { margin-bottom: 25px; }
              .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #555; text-transform: uppercase; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .label { color: #666; }
              .value { font-weight: bold; }
              .amount { color: #22c55e; font-size: 18px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
              td { padding: 10px; border: 1px solid #ddd; }
              .total { background: #f0fdf4; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>COMPROBANTE DE PAGO</h1>
              <p>Pago #${paymentId}</p>
            </div>

            <div class="section">
              <div class="section-title">Cliente</div>
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value">${receiptData.client?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Documento:</span>
                <span class="value">${receiptData.client?.document_number || 'N/A'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Detalles del Pago</div>
              <div class="info-row">
                <span class="label">Monto Total:</span>
                <span class="amount">${this.formatCurrency(receiptData.total_amount || 0)}</span>
              </div>
              <div class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">${paymentDate}</span>
              </div>
              ${receiptData.payment?.reference ? `
              <div class="info-row">
                <span class="label">Referencia:</span>
                <span class="value">${receiptData.payment.reference}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Método de Pago:</span>
                <span class="value">${receiptData.payment?.payment_method?.name || this.getPaymentMethodName(receiptData.payment?.payment_method_id)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Distribución del Pago (${receiptData.distributed_payments?.length || 0} factura(s))</div>
              <table>
                <thead>
                  <tr>
                    <th>Factura</th>
                    <th style="text-align: right;">Monto Aplicado</th>
                  </tr>
                </thead>
                <tbody>
                  ${(receiptData.distributed_payments || []).map(dist => `
                    <tr>
                      <td>Factura #${dist.invoice_id || 'N/A'}</td>
                      <td style="text-align: right;">${this.formatCurrency(dist.amount || 0)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total">
                    <td>TOTAL</td>
                    <td style="text-align: right;">${this.formatCurrency(receiptData.total_amount || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px;">
              <p>Documento generado el ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
        `)

        printWindow.document.close()
        printWindow.print()

        notify('Comprobante generado', 'positive', 'check')
      } catch (error) {
        console.error('Error al generar comprobante:', error)
        notify('Error al generar comprobante', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Shows complete invoice details
     * Loads products, applied payments and totals
     * @param {Object} invoice - Invoice to display
     */
    async viewInvoiceDetail (invoice) {
      try {
        loading(true)
        const { data } = await this.$api.get(`client-statement/invoices/${invoice.id}`)
        this.selectedInvoice = data.invoice
        this.invoiceDetail = data
        this.invoiceDetailDialog = true
      } catch (error) {
        notify('Error al cargar detalle de factura', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Shows complete payment details
     * Loads all invoices affected by this payment
     * @param {Number} paymentId - Payment ID to display
     */
    async viewPaymentDetail (paymentId) {
      try {
        loading(true)
        const { data } = await this.$api.get(`client-statement/payments/${paymentId}`)
        this.paymentDetail = data
        this.paymentDetailDialog = true
      } catch (error) {
        notify('Error al cargar detalle del pago', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Shows a confirmation dialog before deleting a payment
     * Displays payment details and affected invoices
     * @param {Object} payment - Payment object to delete
     */
    confirmDeletePayment (payment) {
      if (!payment) {
        notify('No se pudo identificar el pago', 'negative', 'warning')
        return
      }

      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar este pago de ${this.formatCurrency(payment.amount || 0)}?`,
        cancel: {
          label: 'CANCELAR',
          color: 'grey-7',
          flat: true
        },
        ok: {
          label: 'ELIMINAR',
          color: 'negative',
          unelevated: true
        },
        persistent: true
      }).onOk(() => {
        this.deletePayment(payment.id)
      })
    },

    /**
     * Deletes a payment from the system
     * Updates the account statement and KPIs after deletion
     * @param {Number} paymentId - ID of the payment to delete
     */
    async deletePayment (paymentId) {
      try {
        loading(true)

        // Delete payment via API
        await this.$api.delete(`invoice-payments/${paymentId}`)

        // Close any open dialogs immediately
        this.invoiceDetailDialog = false
        this.paymentDetailDialog = false

        notify('Pago eliminado exitosamente', 'positive', 'check_circle')

        // Reload data immediately for instant feedback
        if (this.selectedClient) {
          // Reload client statement
          await this.onStatementRequest({ pagination: this.statementPagination })
        } else {
          // Reload clients list
          this.loadClients()
        }
      } catch (error) {
        console.error('Error completo al eliminar pago:', error)
      } finally {
        loading(false)
      }
    },

    /**
     * Prints the current invoice
     * Opens the browser's print dialog
     */
    printInvoice () {
      window.print()
    },

    /**
     * Loads available payment methods from API
     */
    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get('payment-methods')
        this.paymentMethods = data
      } catch (error) {
        console.error('Error loading payment methods:', error)
      }
    },

    /**
     * Formats a date to readable format
     * @param {String|Date} date - Date to format
     * @returns {String} Formatted date
     */
    formatDateTime (date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    /**
     * Formats a date to short format
     * @param {String|Date} date - Date to format
     * @returns {String} Formatted date
     */
    formatDate (date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },

    /**
     * Formats a date to time format
     * @param {String|Date} date - Date to format
     * @returns {String} Formatted time
     */
    formatTime (date) {
      if (!date) return '-'
      return new Date(date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    /**
     * Formats an amount to currency format
     * @param {Number} value - Amount to format
     * @returns {String} Formatted amount with currency symbol
     */
    formatCurrency (value) {
      if (value === null || value === undefined) return '-'
      return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },

    async exportClientStatement () {
      try {
        loading(true)
        const params = {
          branch_office_id: this.selectedBranchOffice || this.branchOffice?.id
        }

        // Add date filters if they exist
        if (this.dateFilters.from) {
          params.date_from = this.dateFilters.from
        }
        if (this.dateFilters.to) {
          params.date_to = this.dateFilters.to
        }

        const { data } = await this.$api.get(`client-statement/clients/${this.selectedClient.id}/export-pdf`, {
          params,
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url

        // Add date range to filename if filters are applied
        let filename = `estado-cuenta-${this.selectedClient.name}`
        if (this.dateFilters.from || this.dateFilters.to) {
          filename += '-filtrado'
        }
        filename += '.pdf'

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()

        notify('Estado de cuenta exportado exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify('Error al exportar estado de cuenta', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Filters transactions by selected type
     * Types: 'all', 'invoice', 'payment'
     * Now reloads from server with filter
     */
    filterTransactions () {
      // Reset to first page when filtering
      this.statementPagination.page = 1
      this.onStatementRequest({ pagination: this.statementPagination })
    },

    /**
     * Opens the dialog to register a payment for a specific invoice
     * Initializes the form with the invoice balance
     * @param {Object} invoice - Invoice to receive the payment
     */
    openInvoicePaymentDialog (invoice) {
      this.invoicePaymentData = invoice
      this.invoicePaymentForm = {
        amount: invoice.balance,
        payment_method_id: this.paymentMethods[0]?.id || null,
        date: this.getTodayDate(),
        reference: ''
      }
      this.invoicePaymentDialog = true
    },

    /**
     * Closes the invoice payment dialog
     * Clears the form and invoice data
     */
    closeInvoicePaymentDialog () {
      this.invoicePaymentDialog = false
      this.invoicePaymentData = null
    },

    /**
     * Registers a payment for a specific invoice
     * Updates the account statement without changing view
     */
    async registerInvoicePayment () {
      try {
        this.savingInvoicePayment = true

        await this.$api.post(`client-statement/clients/${this.selectedClient.id}/payments`, {
          amount: this.invoicePaymentForm.amount,
          payment_method_id: this.invoicePaymentForm.payment_method_id,
          date: this.invoicePaymentForm.date,
          reference: this.invoicePaymentForm.reference,
          branch_office_id: this.selectedBranchOffice || this.branchOffice?.id,
          invoice_id: this.invoicePaymentData.id
        })

        notify('Pago registrado exitosamente', 'positive', 'check_circle')

        // Save client reference before closing dialog
        const clientId = this.selectedClient.id

        this.closeInvoicePaymentDialog()

        // Refresh statement without changing view
        const { data: updatedStatement } = await this.$api.get(`client-statement/clients/${clientId}`, {
          params: {
            branch_office_id: this.selectedBranchOffice || this.branchOffice?.id
          }
        })

        // Add expanded property to each transaction
        updatedStatement.transactions.forEach(t => {
          t.expanded = false
        })

        this.statement = updatedStatement
        this.filteredTransactions = updatedStatement.transactions
        this.transactionFilter = 'all'
      } catch (error) {
        notify(error.response?.data?.error || 'Error al registrar pago', 'negative', 'warning')
      } finally {
        this.savingInvoicePayment = false
      }
    }
  }
}
</script>

<style scoped>
/* ============================================ */
/* MODERN DESIGN SYSTEM - Tailwind-inspired */
/* ============================================ */

/* Dark Mode Support */
body.body--dark .modern-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

body.body--dark .modern-header {
  background: linear-gradient(135deg, #685d4a 0%, #2d3748 100%);
}

body.body--dark .kpi-card,
body.body--dark .summary-card,
body.body--dark .modern-card {
  background: #1e293b;
  border-color: #334155;
}

body.body--dark .kpi-label,
body.body--dark .summary-label {
  color: #94a3b8;
}

body.body--dark .statement-table >>> tbody td {
  border-bottom-color: #334155;
}

body.body--dark .statement-table >>> .bg-red-1 {
  background: linear-gradient(90deg, #3f1f1f 0%, #4a2020 100%) !important;
}

body.body--dark .statement-table >>> .bg-green-1 {
  background: linear-gradient(90deg, #1f3f1f 0%, #204a20 100%) !important;
}

body.body--dark .statement-table >>> .bg-blue-1 {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%) !important;
}

body.body--dark .statement-table >>> .bg-primary-1 {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%) !important;
  opacity: 0.3;
}

body.body--dark .client-header {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

body.body--dark .branch-badge {
  background: rgba(255, 255, 255, 0.1);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Modern Header */
.modern-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 10px 20px;
  margin-bottom: 15px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.modern-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modern-title {
  font-size: 20px;
  color: white;
  margin: 0;
}

.modern-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.modern-btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.modern-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.branch-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* KPI Cards - HeroUI Style - Compact */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.kpi-danger::before {
  background: #ef5350;
}

.kpi-success::before {
  background: #66bb6a;
}

.kpi-warning::before {
  background: #ffa726;
}

.kpi-info::before {
  background: #42a5f5;
}

.kpi-card:hover::before {
  transform: scale(1.5);
  opacity: 0.15;
}

.kpi-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

/* Client Header - Modern and Compact */
.client-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 10px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.client-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  gap: 12px;
}

.client-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
}

.client-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.client-details {
  color: white;
}

.client-name {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}

.client-doc {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.client-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.modern-btn-white {
  background: white;
  color: #667eea;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.modern-btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Client Summary Grid - Compact */
.client-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 1;
  visibility: visible;
  position: relative;
  z-index: 1;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-content {
  flex: 1;
  opacity: 1;
  visibility: visible;
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 1;
  visibility: visible;
}

.summary-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  opacity: 1;
  visibility: visible;
}

/* Statement Container */
.statement-container {
  margin-top: 20px;
}

.modern-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Gradients */
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-danger {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.gradient-info {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

/* Modern table */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer tbody tr:hover {
  background-color: #f5f5f5;
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.table-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

body.body--dark .table-title {
  color: #e2e8f0;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  transform: translateY(-2px);
}

/* Account statement table styles - Minimalist and Compact */
.statement-table {
  border-radius: 12px;
  overflow: hidden;
}

.statement-table >>> thead tr {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%);
}

body.body--dark .statement-table >>> thead tr {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
}

.statement-table >>> thead th {
  font-size: 10px;
  font-weight: 700;
  padding: 8px 10px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}

.statement-table >>> tbody td {
  font-size: 12px;
  padding: 0px 10px;
  border-bottom: 1px solid #f1f5f9;
  border-left: none;
  border-right: none;
}

body.body--dark .statement-table >>> tbody td {
  border-bottom-color: #334155;
}

/* Invoice rows - Vibrant red */
.statement-table >>> .bg-red-1 {
  background: #fee2e2 !important;
  border-left: 3px solid #ef4444;
  transition: all 0.2s ease;
}

body.body--dark .statement-table >>> .bg-red-1 {
  background: #450a0a !important;
  border-left-color: #dc2626;
}

/* Payment rows - Vibrant green */
.statement-table >>> .bg-green-1 {
  background: #dcfce7 !important;
  border-left: 3px solid #22c55e;
  transition: all 0.2s ease;
}

body.body--dark .statement-table >>> .bg-green-1 {
  background: #052e16 !important;
  border-left-color: #16a34a;
}

/* Hover effect - Minimalist */
.statement-table >>> tbody tr:hover td {
  background-color: rgba(0, 0, 0, 0.02);
}

body.body--dark .statement-table >>> tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Expanded section - Minimalist */
.statement-table >>> .bg-blue-1 {
  background: #dbeafe !important;
  border-left: 3px solid #3b82f6;
}

body.body--dark .statement-table >>> .bg-blue-1 {
  background: #1e3a8a !important;
  border-left-color: #60a5fa;
}

.statement-table >>> .bg-primary-1 {
  background: var(--primary-light) !important;
  border-left: 3px solid var(--primary);
}

body.body--dark .statement-table >>> .bg-primary-1 {
  background: var(--primary-dark) !important;
  opacity: 0.2;
  border-left-color: var(--primary);
}

/* Inner tables in expand - Compact */
.statement-table >>> .q-markup-table {
  border-radius: 8px;
  overflow: hidden;
}

.statement-table >>> .q-markup-table thead {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%);
}

body.body--dark .statement-table >>> .q-markup-table thead {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
}

.statement-table >>> .q-markup-table th {
  font-size: 10px;
  font-weight: 700;
  padding: 6px 10px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.statement-table >>> .q-markup-table td {
  padding: 6px 10px;
  font-size: 12px;
  border-bottom: 1px solid #f1f5f9;
}

body.body--dark .statement-table >>> .q-markup-table td {
  border-bottom-color: #334155;
}

/* Reduce padding in expanded sections */
.statement-table >>> .bg-blue-1 .q-pa-md,
.statement-table >>> .bg-primary-1 .q-pa-md {
  padding: 12px !important;
}

/* ============================================ */
/* INVOICE DETAIL DIALOG - Invoice Detail */
/* ============================================ */

.invoice-detail-card {
  width: 900px;
  max-width: 95vw;
  border-radius: 16px;
}

.invoice-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.invoice-detail-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.invoice-detail-title-text {
  font-size: 20px;
  font-weight: 700;
}

.invoice-detail-subtitle {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.invoice-detail-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-card {
  background: #f8fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

body.body--dark .detail-card {
  background: #1e293b;
  border-color: #334155;
}

.totals-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #bae6fd;
}

body.body--dark .totals-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
  border-color: #334155;
}

.detail-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

body.body--dark .detail-card-title {
  color: #94a3b8;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

body.body--dark .detail-row {
  border-bottom-color: #334155;
}

.detail-row:last-child {
  border-bottom: none;
}

.balance-row {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #e2e8f0;
  border-bottom: none;
}

body.body--dark .balance-row {
  border-top-color: #334155;
}

.detail-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.detail-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

body.body--dark .detail-value {
  color: #e2e8f0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

body.body--dark .detail-section-title {
  color: #e2e8f0;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

body.body--dark .modern-table {
  background: #1e293b;
}

.modern-table thead {
  background: #f1f5f9;
}

body.body--dark .modern-table thead {
  background: #0f172a;
}

.modern-table th {
  padding: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.body--dark .modern-table th {
  color: #94a3b8;
}

.modern-table td {
  padding: 12px;
  font-size: 13px;
  border-top: 1px solid #e2e8f0;
}

body.body--dark .modern-table td {
  border-top-color: #334155;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafb;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

body.body--dark .payment-item {
  background: #1e293b;
  border-color: #334155;
}

.payment-icon {
  flex-shrink: 0;
}

.payment-info {
  flex: 1;
}

.payment-method {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

body.body--dark .payment-method {
  color: #e2e8f0;
}

.payment-date {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.payment-ref {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.payment-amount {
  font-size: 16px;
  font-weight: 700;
  color: #22c55e;
}

.invoice-detail-actions {
  padding: 16px 20px;
  background: #f8fafb;
  display: flex;
  gap: 12px;
}

body.body--dark .invoice-detail-actions {
  background: #0f172a;
}

.invoice-detail-actions .q-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* ============================================ */
/* PAYMENT RECEIPT DIALOG - Payment Receipt */
/* ============================================ */

.payment-receipt-card {
  width: 550px;
  max-width: 90vw;
  border-radius: 16px;
}

.receipt-header {
  padding: 20px;
  background: #f8fafb;
}

body.body--dark .receipt-header {
  background: #1e293b;
}

.receipt-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.receipt-title-text {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

body.body--dark .receipt-title-text {
  color: #e2e8f0;
}

.receipt-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.receipt-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.receipt-section {
  margin-bottom: 20px;
}

.receipt-section:last-child {
  margin-bottom: 0;
}

.receipt-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

body.body--dark .receipt-section-title {
  color: #94a3b8;
}

.receipt-info {
  padding: 12px;
  background: #f8fafb;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

body.body--dark .receipt-info {
  background: #1e293b;
  border-color: #334155;
}

.receipt-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafb;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

body.body--dark .receipt-row {
  background: #1e293b;
  border-color: #334155;
}

.receipt-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.receipt-value {
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
}

body.body--dark .receipt-value {
  color: #e2e8f0;
}

.receipt-list {
  border-radius: 8px;
  overflow: hidden;
}

.receipt-list-item {
  border-bottom: 1px solid #e2e8f0;
}

body.body--dark .receipt-list-item {
  border-bottom-color: #334155;
}

.receipt-list-item:last-child {
  border-bottom: none;
}

.receipt-actions {
  padding: 16px 20px;
  background: #f8fafb;
  display: flex;
  justify-content: space-between;
}

body.body--dark .receipt-actions {
  background: #0f172a;
}

.receipt-actions .q-btn {
  min-width: 140px;
  border-radius: 8px;
  font-weight: 600;
}

/* ============================================ */
/* KPI HEADER SECTION */
/* ============================================ */

.kpi-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

body.body--dark .kpi-header-section {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.kpi-header-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

body.body--dark .kpi-header-title {
  color: #e2e8f0;
}

.toggle-amounts-btn {
  transition: all 0.3s ease;
}

.toggle-amounts-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

body.body--dark .toggle-amounts-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ============================================ */
/* DATE FILTERS SECTION */
/* ============================================ */

.date-filters-section {
  animation: fadeIn 0.4s ease-out;
}

.date-filters-section .q-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

body.body--dark .date-filters-section .q-card {
  background: #1e293b;
  border-color: #334155;
}

/* ============================================ */
/* FILTER DIALOG - Minimalist and Modern */
/* ============================================ */

.filter-dialog {
  width: 480px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
}

body.body--dark .filter-header {
  background: #1e293b;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
}

body.body--dark .filter-title {
  color: #e2e8f0;
}

body.body--dark .close-btn:hover {
  color: #e2e8f0;
}

.filter-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.body--dark .filter-label {
  color: #94a3b8;
}

.filter-input {
  width: 100%;
}

.status-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.status-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.status-btn:hover {
  transform: translateY(-2px);
}

.filter-actions {
  padding: 16px 20px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
}

body.body--dark .filter-actions {
  background: #0f172a;
}

.filter-actions .q-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 600;
}

/* Modern Filter Item styles */
.filter-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;
}

body.body--dark .filter-item {
  background: #1d1d1d;
  border-color: #333;
}

.border-grey {
  border: 1px solid #ddd;
  border-radius: 8px;
}

body.body--dark .border-grey {
  border-color: #444;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-container {
    padding: 12px;
  }

  .modern-header,
  .client-header {
    padding: 16px;
    border-radius: 12px;
  }

  .modern-title,
  .client-name {
    font-size: 20px;
  }

  .kpi-grid,
  .client-summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header-content,
  .client-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-card,
  .summary-card {
    padding: 12px;
  }

  .kpi-value,
  .summary-value {
    font-size: 20px;
  }

  .icon-wrapper,
  .client-avatar {
    width: 48px;
    height: 48px;
  }

  .filter-dialog {
    width: 95vw;
  }

  .status-buttons {
    grid-template-columns: 1fr;
  }

  .filter-content {
    padding: 16px;
  }

  .filter-group {
    margin-bottom: 16px;
  }
}

/* Clases para tarjetas compactas (Consistencia con InvoicePage) */
.compact-card-header {
  padding: 0.75rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

.compact-card-footer {
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  padding-top: 0 !important;
}

.compact-total-container {
  padding: 0.75rem !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.border-bottom-light {
  border-bottom: 1px solid #f1f5f9;
}

.border-bottom-light:last-child {
  border-bottom: none;
}

.fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1023px) {
  :deep(.q-table__top) {
    padding: 8px 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }
  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
