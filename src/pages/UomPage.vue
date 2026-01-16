<template>
  <div class="q-pa-md">
    <q-card flat>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="uoms" label="Unidades de Medida" icon="straighten" />
        <q-tab name="categories" label="Categorías" icon="category" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- Tab: Units of Measure -->
        <q-tab-panel name="uoms">
          <div class="row q-mb-md justify-between items-center">
            <div class="text-h6 text-primary">Gestionar Unidades</div>
            <q-btn
              color="primary"
              icon="add_circle"
              label="Agregar Unidad"
              @click="openAddUomDialog"
              unelevated
            />
          </div>

          <q-table
            :rows="uoms"
            :columns="uomColumns"
            row-key="id"
            :loading="loadingUoms"
            :filter="uomFilter"
            flat
            bordered
          >
            <template v-slot:top-right>
              <q-input filled dense debounce="300" v-model="uomFilter" placeholder="Buscar">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-is_reference="props">
              <q-td :props="props">
                <q-chip
                  v-if="props.value"
                  color="positive"
                  text-color="white"
                  dense
                  square
                  label="Referencia"
                />
                <span v-else>-</span>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="editUom(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="deleteUom(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Tab: Categories -->
        <q-tab-panel name="categories">
          <div class="row q-mb-md justify-between items-center">
            <div class="text-h6 text-primary">Categorías de Unidades</div>
            <q-btn
              color="primary"
              icon="add_circle"
              label="Nueva Categoría"
              @click="openAddCategoryDialog"
              unelevated
            />
          </div>

          <q-table
            :rows="uomCategories"
            :columns="categoryColumns"
            row-key="id"
            :loading="loadingCategories"
            flat
            bordered
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="editCategory(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="deleteCategory(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog: UOM Form -->
    <q-dialog v-model="uomDialog" persistent>
      <q-card style="width: 500px">
        <q-form @submit="saveUom">
          <q-card-section class="bg-primary text-white row items-center">
            <div class="text-h6">{{ uom.id ? 'Editar' : 'Nueva' }} Unidad</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input
              v-model="uom.name"
              label="Nombre*"
              filled
              dense
              :rules="[val => !!val || 'Requerido']"
            />
            <q-input
              v-model="uom.acronym"
              label="Acrónimo*"
              filled
              dense
              :rules="[val => !!val || 'Requerido']"
            />
            <q-select
              v-model="uom.uom_category_id"
              :options="uomCategories"
              option-label="name"
              option-value="id"
              label="Categoría*"
              filled
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            />
            <q-input
              v-model.number="uom.ratio"
              type="number"
              step="any"
              label="Ratio (con respecto a la unidad de referencia)"
              filled
              dense
              hint="Ej: Si la base es Gramo, Kilogramo tiene ratio 1000"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
              :disable="uom.is_reference"
            />
            <q-toggle
              v-model="uom.is_reference"
              label="Es la unidad de referencia de esta categoría"
              dense
              @update:model-value="handleReferenceToggle"
            />
            <div v-if="uom.is_reference" class="text-caption text-orange">
              Si marcas esto, el ratio se fijará en 1.0 y otras unidades se desmarcarán como referencia.
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="secondary" v-close-popup />
            <q-btn unelevated label="Guardar" color="primary" type="submit" :loading="savingUom" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog: Category Form -->
    <q-dialog v-model="categoryDialog" persistent>
      <q-card style="width: 400px">
        <q-form @submit="saveCategory">
          <q-card-section class="bg-primary text-white row items-center">
            <div class="text-h6">{{ category.id ? 'Editar' : 'Nueva' }} Categoría</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="category.name"
              label="Nombre de Categoría*"
              filled
              dense
              :rules="[val => !!val || 'Requerido']"
              autofocus
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="secondary" v-close-popup />
            <q-btn unelevated label="Guardar" color="primary" type="submit" :loading="savingCategory" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { notify } from 'src/const/mixins'

export default {
  name: 'UomPage',
  data () {
    return {
      tab: 'uoms',
      uoms: [],
      uomCategories: [],
      loadingUoms: false,
      loadingCategories: false,
      savingUom: false,
      savingCategory: false,
      uomFilter: '',
      
      uomDialog: false,
      uom: {
        id: null,
        name: '',
        acronym: '',
        uom_category_id: null,
        ratio: 1.0,
        is_reference: false
      },

      categoryDialog: false,
      category: {
        id: null,
        name: ''
      },

      uomColumns: [
        { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
        { name: 'acronym', align: 'left', label: 'Acrónimo', field: 'acronym', sortable: true },
        { name: 'category', align: 'left', label: 'Categoría', field: row => row.category?.name || 'N/A', sortable: true },
        { name: 'ratio', align: 'right', label: 'Ratio', field: 'ratio', sortable: true },
        { name: 'is_reference', align: 'center', label: 'Estado', field: 'is_reference', sortable: true },
        { name: 'actions', align: 'center', label: 'Acciones', field: 'id' }
      ],

      categoryColumns: [
        { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
        { name: 'units_count', align: 'center', label: 'Nº Unidades', field: row => row.unit_of_measures?.length || 0 },
        { name: 'actions', align: 'center', label: 'Acciones', field: 'id' }
      ]
    }
  },

  mounted () {
    this.refreshAll()
  },

  methods: {
    refreshAll () {
      this.getUoms()
      this.getCategories()
    },

    async getUoms () {
      this.loadingUoms = true
      try {
        const { data } = await this.$api.get('unit-of-measures')
        this.uoms = data
      } catch (error) {
        notify('Error al cargar unidades', 'negative', 'warning')
      } finally {
        this.loadingUoms = false
      }
    },

    async getCategories () {
      this.loadingCategories = true
      try {
        const { data } = await this.$api.get('uom-categories')
        this.uomCategories = data
      } catch (error) {
        notify('Error al cargar categorías', 'negative', 'warning')
      } finally {
        this.loadingCategories = false
      }
    },

    // UOM Methods
    openAddUomDialog () {
      this.uom = {
        id: null,
        name: '',
        acronym: '',
        uom_category_id: this.uomCategories[0]?.id || null,
        ratio: 1.0,
        is_reference: false
      }
      this.uomDialog = true
    },

    editUom (row) {
      this.uom = { ...row }
      this.uomDialog = true
    },

    handleReferenceToggle (val) {
      if (val) {
        this.uom.ratio = 1.0
      }
    },

    async saveUom () {
      this.savingUom = true
      try {
        if (this.uom.id) {
          await this.$api.put(`unit-of-measures/${this.uom.id}`, this.uom)
          notify('Unidad actualizada', 'positive', 'check_circle')
        } else {
          await this.$api.post('unit-of-measures', this.uom)
          notify('Unidad creada', 'positive', 'check_circle')
        }
        this.uomDialog = false
        this.getUoms()
      } catch (error) {
        notify(error.response?.data?.message || 'Error al guardar unidad', 'negative', 'warning')
      } finally {
        this.savingUom = false
      }
    },

    async deleteUom (row) {
      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar la unidad "${row.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$api.delete(`unit-of-measures/${row.id}`)
          notify('Unidad eliminada', 'positive', 'check_circle')
          this.getUoms()
        } catch (error) {
          notify('Error al eliminar unidad', 'negative', 'warning')
        }
      })
    },

    // Category Methods
    openAddCategoryDialog () {
      this.category = { id: null, name: '' }
      this.categoryDialog = true
    },

    editCategory (row) {
      this.category = { ...row }
      this.categoryDialog = true
    },

    async saveCategory () {
      this.savingCategory = true
      try {
        if (this.category.id) {
          await this.$api.put(`uom-categories/${this.category.id}`, this.category)
          notify('Categoría actualizada', 'positive', 'check_circle')
        } else {
          await this.$api.post('uom-categories', this.category)
          notify('Categoría creada', 'positive', 'check_circle')
        }
        this.categoryDialog = false
        this.refreshAll()
      } catch (error) {
        notify('Error al guardar categoría', 'negative', 'warning')
      } finally {
        this.savingCategory = false
      }
    },

    async deleteCategory (row) {
      this.$q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar la categoría "${row.name}"? Esto podría afectar a las unidades asociadas.`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$api.delete(`uom-categories/${row.id}`)
          notify('Categoría eliminada', 'positive', 'check_circle')
          this.refreshAll()
        } catch (error) {
          notify('No se puede eliminar la categoría si tiene unidades asociadas.', 'negative', 'warning')
        }
      })
    }
  }
}
</script>
