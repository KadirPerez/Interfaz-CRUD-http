<template>
    <v-data-table :headers="headers" :items="ubicaciones">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Ubicaciones</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn class="mb-2" color="primary" dark v-bind="props">
                Nueva ubicacion
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
                        <img :src="generarURL(editedItem.imagen, true)" alt="Imagen seleccionada" style="max-width: 100%;">
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
          
          <v-dialog v-model="dialogActivo" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{"Activo a agregar"}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="activo.descripcion"
                      :items="activos"
                      label="Seleccionar activo"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeAddActivo">
                Cancelar
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="saveAddActivo">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDeleteActivo" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{"Activo a borrar"}}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-select
                        v-model="activo.descripcion"
                        :items="activos"
                        label="Seleccionar activo"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="closeDeleteActivo">
                  Cancelar
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="saveDeleteActivo">
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
          @click="addActivo(item)"
        >
          mdi-devices
        </v-icon>
        <v-icon
          class="me-2"
          size="small"
          @click="deleteActivo(item)"
        >
          mdi-alpha-x-circle
        </v-icon>
      </template>
    </v-data-table>
  </template>
  
  
  <script>
    import axios from 'axios';
  
    export default {
      data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
          { title: 'ID', sortable: false, key: 'id' },
          { title: 'Descripcion', sortable: false, key: 'descripcion' },
          { title: 'Imagen', sortable: false, key: 'imagen' },
          { title: 'Activos', sortable: false, key: 'activos' },
          { title: 'Accion', sortable: false, key: 'actions'}
        ],
        ubicaciones: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {},
        dialogDeleteActivo: false,
        dialogActivo: false,
        activos: [],
        activo: {}
      }),
  
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'Nueva ubicacion' : 'Ubicacion a editar'
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
            const ubicacionesRecibidas = await axios.get('https://localhost:4000/ubicacion');
            const ubicacionesProcesadas = [];
  
            for (const ubicacion of ubicacionesRecibidas.data) {
              const activos = await axios.get(`https://localhost:4000/ubicacion/${ubicacion.id}/activos`)
  
              ubicacion.activos = activos.data.map(activo => activo.descripcion).join(', ')
  
              ubicacionesProcesadas.push(ubicacion);
            }
  
            this.ubicaciones = ubicacionesProcesadas;
          } catch (error) {
            console.error('Error initializing:', error);
          }
        },
  
        editItem (item) {
          this.editedIndex = this.ubicaciones.indexOf(item)
          this.editedItem = Object.assign({}, item)
          if(this.editedItem.imagen != null) this.editedItem.imagen = item.imagen.data 
          this.dialog = true
        },
  
        deleteItem(item) {
          this.dialogDelete = true
          this.editedIndex = this.ubicaciones.indexOf(item);
          this.editedItem = this.ubicaciones[this.editedIndex];
        },
  
        async deleteItemConfirm () {
          await axios.delete(`https://localhost:4000/ubicacion/${this.editedItem.id}`);
          this.closeDelete()
        },
  
        close () {
          this.dialog = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        closeDelete () {
          this.initialize()
          this.dialogDelete = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        async save() {
          if (this.editedIndex > -1) {
            const id = this.ubicaciones[this.editedIndex].id;
            await axios.put(`https://localhost:4000/ubicacion/${id}`, this.editedItem);
            this.initialize();
            this.close();
  
          } else {
            await axios.post("https://localhost:4000/ubicacion", this.editedItem);
            this.initialize();
            this.close();
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
      async addActivo (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogActivo = true

        const activo = await axios.get(`https://localhost:4000/activo`)

        const dataActivos = activo.data
        const activos = []

        for (const activo of dataActivos) {
          activos.push(activo.descripcion)
        }

        this.activos = activos

      },

      closeAddActivo () {
        this.dialogActivo = false
        this.activo = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
      })
      },

      async saveAddActivo () {
        try {
          const activo = await axios.get(`https://localhost:4000/activo/descripcion/${this.activo.descripcion}`)
          axios.put(`https://localhost:4000/activo/${activo.data.id}/ubicacion/${this.editedItem.id}`)

          this.closeAddActivo();
          await this.initialize()
        } catch (error) {
          console.error('Error al guardar el responsable:', error);
        }
      },

      async deleteActivo (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDeleteActivo = true
        const activo = await axios.get(`https://localhost:4000/ubicacion/${item.id}/activos`)
        const dataActivos = activo.data
        const activos = []
        for (const activo of dataActivos) {
          activos.push(activo.descripcion)
        }
        this.activos = activos
      },

      closeDeleteActivo () {
        this.dialogDeleteActivo = false
        this.activo = {}
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      async saveDeleteActivo () {
        try {
          const activo = await axios.get(`https://localhost:4000/activo/descripcion/${this.activo.descripcion}`)
          axios.put(`https://localhost:4000/activo/${activo.data.id}/borrarUbicacion`)

          this.closeDeleteActivo();
          await this.initialize()
        } catch (error) {
          console.error('Error al borrar el activo:', error);
        }
      }
    },
  }
  </script>