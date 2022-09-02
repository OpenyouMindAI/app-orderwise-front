<template>
  <q-page padding>
    <q-table
      title="Productos"
      :rows="products"
      :columns="columns"
      row-key="name"
      grid
      dense
      :filter="filter"
      :loading="loadingPage"
    >
      <template v-slot:top-right>
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
          <q-card>
            <q-card-section class="text-center q-pa-xs">
              <q-badge round color="negative" floating>
                <q-btn icon="close" size="xs" dense @click="deleteProduct(props.row)"/>
              </q-badge>
              <strong>{{ props.row.code }}</strong>
            </q-card-section>
            <q-separator />
            <q-card-section class="flex flex-center q-pa-xs">
              <q-list class="full-width" dense>
                <q-item clickable v-ripple active-class="text-orange">
                  <q-item-section class="text-bold">Categoria:</q-item-section>
                  <q-item-section side>{{ props.row.category }}</q-item-section>
                  <q-popup-edit v-model="props.row.category" auto-save v-slot="scope" @update:model-value="editProduct(props.row)">
                    <q-input type="text" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
                  </q-popup-edit>
                </q-item>
                <q-item clickable v-ripple active-class="bg-teal-1 text-grey-8">
                  <q-item-section class="text-bold">Sub Categoria:</q-item-section>
                  <q-item-section side>{{ props.row.sub_category }}</q-item-section>
                  <q-popup-edit v-model="props.row.sub_category" auto-save v-slot="scope" @update:model-value="editProduct(props.row)">
                    <q-input type="text" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
                  </q-popup-edit>
                </q-item>
                <q-item clickable v-ripple active-class="bg-teal-1 text-grey-8">
                  <q-item-section>
                    <span class="text-bold">Descripción:</span>
                    {{ props.row.description }}
                  </q-item-section>
                  <q-popup-edit v-model="props.row.description" auto-save v-slot="scope" @update:model-value="editProduct(props.row)">
                    <q-input type="textarea" v-model="scope.value" dense autofocus @keyup.enter="scope.set" autogrow/>
                  </q-popup-edit>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="prompt">
      <q-card style="min-width: 350px">
        <q-form @submit="addProduct" ref="product" @reset="clean">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Agregar Producto</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-gutter-sm">
            <q-input dense outlined v-model="code" autofocus type="number" label="Código" :rules="[ val => val && val !== null || 'El campo es requerido']">
              <template v-slot:append>
                <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
              </template>
            </q-input>
            <q-input dense outlined v-model="category" label="Categoria" :rules="[ val => val && val !== null || 'El campo es requerido']"/>
            <q-input dense outlined v-model="subCategory" label="Sub Categoria" :rules="[ val => val && val !== null || 'El campo es requerido']"/>
            <q-input dense outlined v-model="description" type="textarea" label="Descripción" autogrow :rules="[ val => val && val !== null || 'El campo es requerido']"/>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Cancelar" v-close-popup type="reset"/>
            <q-btn color="primary" label="Agregar" type="submit" :loading="loadingPage"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogImportProduct">
      <q-card style="min-width: 350px">
        <q-form @submit="importProducts" ref="product" @reset="clean">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Importar Productos</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-gutter-sm">
            <q-file outlined v-model="file" @update:model-value="onChange" label="Productos">
              <template v-slot:append>
                <q-avatar>
                  <q-icon size="md" name="cloud_upload" />
                </q-avatar>
              </template>
            </q-file>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-none">
            <xlsx-read :file="file">
              <xlsx-json @parsed="getJson"/>
            </xlsx-read>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="negative" label="Cancelar" v-close-popup type="reset"/>
            <q-btn color="primary" label="Importar" type="submit" :loading="loadingPage"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab color="secondary" icon="keyboard_arrow_up" direction="up">
        <q-fab-action color="orange" @click="dialogImportProduct = true" icon="cloud_upload" />
        <q-fab-action icon="add" color="primary" @click="prompt = true"/>
      </q-fab>
    </q-page-sticky>
    <q-dialog v-model="modelScan">
      <stream-barcode-reader @decode="getOnePorduct"/>
    </q-dialog>
  </q-page>
</template>

<script>
import { db } from '../dbfire'
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { XlsxRead, XlsxJson } from 'vue3-xlsx/dist/vue3-xlsx.cjs.prod'
import { StreamBarcodeReader } from 'vue-barcode-reader'
export default {
  components: {
    XlsxRead,
    XlsxJson,
    StreamBarcodeReader
  },
  data () {
    return {
      dialogImportProduct: false,
      file: null,
      modelScan: false,
      filter: '',
      code: null,
      description: null,
      category: null,
      subCategory: null,
      products: [],
      prompt: false,
      dialogScanner: false,
      loadingPage: false,
      productsImport: [],
      columns: [
        { name: 'code', align: 'left', label: 'Código', field: 'code', sortable: true },
        {
          name: 'description',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.description,
          sortable: true
        },
        { name: 'category', align: 'left', label: 'Categoria', field: 'category', sortable: true },
        { name: 'sub_category', align: 'left', label: 'Sub Categoria', field: 'sub_category', sortable: true }
      ]
    }
  },
  created () {
    this.getProducts()
  },
  methods: {
    /**
     * Delete Product
     * @param {Object} data product
     */
    deleteProduct (data) {
      try {
        this.$q.dialog({
          title: 'Alerta',
          message: '¿Desea eliminar el producto?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await deleteDoc(doc(db, 'products', String(data.code)))
          this.getProducts()
          this.$q.notify({
            message: 'Producto eliminado extisamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    /**
     * Delete Product
     * @param {Object} data product
     */
    async editProduct (data) {
      try {
        await updateDoc(doc(db, 'products', String(data.code)), data)
        this.getProducts()
        this.$q.notify({
          message: 'Producto editado extisamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (error) {
        console.log(error)
      }
    },
    async getOnePorduct (code) {
      const docSnap = await getDoc(doc(db, 'products', code))
      if (docSnap.exists()) {
        const product = docSnap.data()
        this.code = product.code
        this.sub_category = product.sub_category
        this.category = product.category
        this.description = product.description
      } else {
        this.code = code
        this.$q.notify({
          message: 'Producto no encontrado',
          icon: 'warning',
          color: 'negative'
        })
      }
      this.modelScan = false
    },
    async getJson (products) {
      this.productsImport = products
    },
    importProducts () {
      this.productsImport.forEach(async (product) => {
        await setDoc(doc(db, 'products', String(product.code)), product)
      })
      this.getProducts()
      this.dialogImportProduct = false
    },
    onChange (value) {
      this.file = value
    },
    async addProduct () {
      try {
        this.loadingPage = true
        await setDoc(doc(db, 'products', String(this.code)), {
          code: this.code,
          description: this.description,
          category: this.category,
          sub_category: this.subCategory
        })
        this.loadingPage = false
        this.getProducts()
        this.clean()
        this.prompt = false
        this.$q.notify({
          message: 'Producto agregado extisamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    },
    /**
     * Reset validation
     * @param {Object} ref ref DOM
     */
    resetValidations (ref) {
      setTimeout(() => {
        ref.resetValidation()
      }, 100)
    },
    /**
     * clean form delivery note
     */
    clean () {
      this.code = null
      this.description = null
      this.price = null
      this.resetValidations(this.$refs.product)
      this.productsImport = []
      this.file = null
      this.dialogImportProduct = false
    },
    /**
     * Get guides all
     */
    async getProducts () {
      try {
        const productsCol = collection(db, 'products')
        this.loadingPage = true
        const productsnapshot = await getDocs(productsCol)
        this.products = productsnapshot.docs.map(doc => doc.data())
        this.loadingPage = false
      } catch (error) {
        console.error('Error adding document: ', error)
      }
    }
  }
}
</script>
