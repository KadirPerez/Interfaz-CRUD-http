<template>
  <v-data-table :headers="headers" :items="activos">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Activos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              Nuevo activo
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-container>
              <v-row>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model="editedItem.numSerie"
                          label="Numero de serie"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="editedItem.numInventario"
                          label="Numero de inventario"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="editedItem.descripcion"
                          label="Descripcion"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                    <v-col cols="12">
                      <input type="file" ref="fileInput" style="display: none" @change="handleFileChange">
                      <v-text-field
                        v-model="editedItem.nombreImagen"
                        label="Imagen"
                        readonly
                        @click="openFilePicker"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="editedItem.imagen">
                    <v-col cols="12">
                      <img :src="generarURL(this.editedItem.imagen, true)" alt="Imagen seleccionada" style="max-width: 100%;">
                    </v-col>
                  </v-row>
                  </v-container>
                </v-card-text>
              </v-row>
              <v-row justify="end">
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="close"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="save"
                  >
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-row>
            </v-container>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogResponsable" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{"Responsable a agregar"}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="responsable.nombre"
                      :items="responsablesDisponibles"
                      label="Seleccionar responsable"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeAddResponsable">
                Cancelar
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="saveAddResponsable">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogUbicacion" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{"Ubicacion a agregar"}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="this.ubicacion.descripcion"
                      :items="ubicacionesDisponibles"
                      label="Seleccionar ubicacion"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="this.closAddUbicacion">
                Cancelar
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="this.saveAddUbicacion">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogTag" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{"Tag a agregar"}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="this.tag.tag"
                      :items="tagsDisponibles"
                      label="Seleccionar tag"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="this.closAddTag">
                Cancelar
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="this.saveAddTag">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDeleteTag" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{"Tag a eliminar"}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="tag.tag"
                      :items="tagsAgregados"
                      label="Seleccionar tag"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="this.closeDeleteTag">
                Cancelar
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="this.saveDeleteTag">
                Borrar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-container>
            <v-row justify="center">
              <v-card-title class="text-h5">¿Seguro que desea borrar este item?</v-card-title>
            </v-row>
            <v-row justify="center">
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancelar</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">Continuar</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-row>
          </v-container>
        </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <template v-slot:item.imagen="{ item }">
      <img :src="generarURL(item.imagen, false)" alt="Imagen" style="max-width: 300px; max-height: 300px;">
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon
        class="me-2"
        size="small"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        class="me-2"
        size="small"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
      <v-icon
        class="me-2"
        size="small"
        @click="addUbicacion(item)"
      >
        mdi-map-marker
      </v-icon>
      <v-icon
        class="me-2"
        size="small"
        @click="addResponsable(item)"
      >
        mdi-account
      </v-icon>
      <v-icon
        class="me-2"
        size="small"
        @click="addTag(item)"
      >
        mdi-tag
      </v-icon>
      <v-icon
        class="me-2"
        size="small"
        @click="deleteTag(item)"
      >
        mdi-tag-off
      </v-icon>
    </template>
  </v-data-table>
</template>


<script>
  import axios from 'axios';

  export default {
    data: () => ({
      dialogDeleteTag: false,
      dialogTag: false,
      dialogUbicacion: false,
      dialogResponsable: false,
      dialog: false,
      dialogDelete: false,
      headers: [
        { title: 'ID', sortable: false, key: 'id' },
        { title: 'Numero de serie', sortable: false, key: 'numSerie' },
        { title: 'Numero de inventario', sortable: false, key: 'numInventario' },
        { title: 'Descripcion', sortable: false, key: 'descripcion'},
        { title: 'Ubicacion', sortable: false, key: 'ubicacion'},
        { title: 'Responsable', sortable: false, key: 'responsable'},
        { title: 'Imagen', sortable: false, key: 'imagen'},
        { title: 'Tags', sortable: false, key: 'tags'},
        { title: 'Accion', sortable: false, key: 'actions'}
      ],
      activos: [],
      editedIndex: -1,
      editedItem: {},
      defaultItem: {},
      responsable: {},
      ubicacion: {}, 
      tag: {},
      responsablesDisponibles: [],
      ubicacionesDisponibles: [],
      tagsDisponibles: [],
      tagsAgregados: []
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo activo' : 'Activo a editar'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    created () {
      this.initialize()
    },

    methods: {
      async initialize() {
        try {
          const activosRecibidos = await axios.get('https://localhost:4000/activo');
          const activosProcesados = [];

          for (const activo of activosRecibidos.data) {
            const tags = await axios.get(`https://localhost:4000/activo/${activo.id}/tags`)
      
            let responsable = {}
            let ubicacion = {}

            if(activo.idResponsable != null) {
              responsable = await axios.get(`https://localhost:4000/responsable/${activo.idResponsable}`)
              activo.responsable = responsable.data.nombre
            }

            if(activo.idUbicacion != null) {
              ubicacion = await axios.get(`https://localhost:4000/ubicacion/${activo.idUbicacion}`)
              activo.ubicacion = ubicacion.data.descripcion
            }
            activo.tags = tags.data.map(tag => tag.tag).join(', ')
            activosProcesados.push(activo);
          }
          await this.obtenerEmpleados()
          await this.obtenerUbicaciones()
          await this.obtenerTags()
          
          this.activos = activosProcesados;
        } catch (error) {
          console.error('Error initializing:', error);
        }
      },

      editItem (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        if(this.editedItem.imagen != null) this.editedItem.imagen = item.imagen.data 
        this.dialog = true
      },

      async save() {
        try{
          if (this.editedIndex > -1) {
            const id = this.activos[this.editedIndex].id;
            await axios.put(`https://localhost:4000/activo/${id}`, this.editedItem);
            this.close();
            this.initialize()
          } else {
            await axios.post("https://localhost:4000/activo", this.editedItem);
            this.close();
            this.initialize()
          }
        } catch (error) {
          console.error('Error al guardar la ubicacion:', error);
        }
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },


      deleteItem(item) {
        this.dialogDelete = true
        this.editedIndex = this.activos.indexOf(item);
        this.editedItem = this.activos[this.editedIndex];
      },

      async deleteItemConfirm () {
        await axios.delete(`https://localhost:4000/activo/${this.editedItem.id}`);
        this.initialize()
        this.closeDelete()
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      addResponsable (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogResponsable = true
      },

      closeAddResponsable () {
        this.dialogResponsable = false
        this.responsable = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async saveAddResponsable () {
        try {
          const responsableAgregado = await axios.get(`https://localhost:4000/responsable/nombre/${this.responsable.nombre}`)
          await axios.put(`https://localhost:4000/activo/${this.editedItem.id}/responsable/${responsableAgregado.data.numEmpleado}`)
          await this.closeAddResponsable();
          await this.initialize()
        } catch (error) {
          console.error('Error al guardar el responsable:', error);
        }
      }, 

      addUbicacion (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogUbicacion = true
      },

      closAddUbicacion () {
        this.dialogUbicacion = false
        this.ubicacion = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async saveAddUbicacion () {
        try {
          const ubicacionAgregada = await axios.get(`https://localhost:4000/ubicacion/descripcion/${this.ubicacion.descripcion}`)
          await axios.put(`https://localhost:4000/activo/${this.editedItem.id}/ubicacion/${ubicacionAgregada.data.id}`)
          await this.closAddUbicacion()
          await this.initialize()
        } catch (error) {
          console.error('Error al guardar la ubicacion:', error);
        }
      },

      addTag (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogTag = true
      },
      closAddTag () {
        this.dialogTag = false
        this.tag = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      async saveAddTag() {
        try{
          const tagAgregado = await axios.get(`https://localhost:4000/tag/tag/${this.tag.tag}`)
          await axios.put(`https://localhost:4000/activo/${this.editedItem.id}/tag/${tagAgregado.data.id}`)
          await this.closAddTag()
          await this.initialize()
        } catch (error) {
          console.error('Error al guardar la ubicacion:', error);
        }
      }, 
      openFilePicker() {
        this.$refs.fileInput.click();
      },
      handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          const vm = this;

          reader.onload = function(event) {
            const fileContent = event.target.result;
            const dataArray = Array.from(new Uint8Array(fileContent))
            vm.editedItem.imagen = dataArray
          };

          reader.readAsArrayBuffer(file)
          this.editedItem.nombreImagen = file.name
        }
      },
      generarURL(buffer, editando){
        let blob = null

        if(buffer != null){
          if(editando){
            blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
          } else{
            blob = new Blob([new Uint8Array(buffer.data)], { type: 'image/png' });
          }
          return URL.createObjectURL(blob)
        }
      },
      async obtenerEmpleados(){
        const empleado = await axios.get('https://localhost:4000/responsable')
        const dataEmpleados = empleado.data
        const empleados = []

        for (const empleado of dataEmpleados) {
          empleados.push(empleado.nombre)
        }

        this.responsablesDisponibles = empleados
      },
      async obtenerUbicaciones(){
        const ubicacion = await axios.get('https://localhost:4000/ubicacion')
        const dataUbicacion = ubicacion.data
        const ubicaciones = []

        for (const ubicacion of dataUbicacion) {
          ubicaciones.push(ubicacion.descripcion)
        }

        this.ubicacionesDisponibles = ubicaciones
      },
      async obtenerTags(){
        const tag = await axios.get('https://localhost:4000/tag')
        const dataTags = tag.data
        const tags = []

        for (const tag of dataTags) {
          tags.push(tag.tag)
        }

        this.tagsDisponibles = tags
      },
      async deleteTag(item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDeleteTag = true
        const tag = await axios.get(`https://localhost:4000/activo/${item.id}/tags`)
        const dataTag = tag.data
        const tags = []
        for (const tag of dataTag) {
          tags.push(tag.tag)
        }
        this.tagsAgregados = tags
      },

      closeDeleteTag () {
        this.dialogDeleteTag = false
        this.tag = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      
      async saveDeleteTag() {
        try{
          const tagEliminar = await axios.get(`https://localhost:4000/tag/tag/${this.tag.tag}`)
          axios.put(`https://localhost:4000/activo/${this.editedItem.id}/borrarTag/${tagEliminar.data.id}`)

          this.closeDeleteTag()
          await this.initialize()
          
          
        } catch (error) {
          console.error('Error al eliminar tag:', error);
        }
      }
    }
  }

</script>