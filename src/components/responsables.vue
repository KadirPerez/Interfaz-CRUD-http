<template>
    <v-data-table :headers="headers" :items="responsables">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Responsables</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="750px">
            <template v-slot:activator="{ props }">
              <v-btn class="mb-2" color="primary" dark v-bind="props">
                Nuevo responsable
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
                            v-model="editedItem.numEmpleado"
                            label="Numero de empleado"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="editedItem.nombre"
                            label="Nombre"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-select
                            v-model="editedItem.activos"
                            :items="activos"
                            label="Activos"
                            multiple
                            chips
                          ></v-select>
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
      </template>
    </v-data-table>
</template>
  
  
  <script>
    import axios from 'axios';
    import { useStore } from 'vuex';

    export default {
      data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
          { title: 'ID', sortable: false, key: 'id' },
          { title: 'Numero de empleado', sortable: false, key: 'numEmpleado' },
          { title: 'Nombre', sortable: false, key: 'nombre' },
          { title: 'Imagen', sortable: false, key: 'imagen'},
          { title: 'Activos', sortable: false, key: 'activos'},
          { title: 'Accion', sortable: false, key: 'actions'}
        ],
        responsables: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {},
        dialogDeleteActivo: false,
        dialogActivo: false,
        activos: [],
        activo: {},
        token : useStore().state.token
      }),
  
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'Nuevo responsable' : 'Responsable a editar'
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
            const responsablesRecibidos = await axios.get('https://localhost:4000/responsable', {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            const responsablesProcesados = [];
  
            for (const responsable of responsablesRecibidos.data) {
              const activos = await axios.get(`https://localhost:4000/responsable/${responsable.id}/activos`, {
                headers: {
                  Authorization: `Bearer ${this.token}`
                }
              })

              if(activos.data.length != 0) {
                responsable.activos = activos.data.map(activo => activo.descripcion).join(', ')
              }
  
              responsablesProcesados.push(responsable);
            }
            await this.obtenerActivos()
            this.responsables = responsablesProcesados;
          } catch (error) {
            console.error('Error initializing:', error);
          }
        },
  
        editItem (item) {
          this.editedIndex = this.responsables.indexOf(item)
          this.editedItem = Object.assign({}, item)
          if(this.editedItem.imagen != null) this.editedItem.imagen = item.imagen.data 
          if(this.editedItem.activos != undefined)this.editedItem.activos = item.activos.split(', ')
          this.dialog = true
        },
  
        deleteItem(item) {
          this.dialogDelete = true
          this.editedIndex = this.responsables.indexOf(item);
          this.editedItem = this.responsables[this.editedIndex];
        },
  
        async deleteItemConfirm () {
          await axios.delete(`https://localhost:4000/responsable/${this.editedItem.id}`, {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
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
        async borrarActivos() {
          if(this.editedIndex != -1) {
            const activos = await axios.get(`https://localhost:4000/responsable/${this.editedItem.id}/activos`, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            for (let i = 0; i < activos.data.length; i++) {
              let activo = activos.data[i];
              axios.put(`https://localhost:4000/activo/${activo.id}/borrarResponsable`, {
                headers: {
                  Authorization: `Bearer ${this.token}`
                }
              })
            }
          }
        },
        async save() {
          if (this.editedIndex > -1) {
            await this.borrarActivos()
            const id = this.responsables[this.editedIndex].id
            await axios.put(`https://localhost:4000/responsable/${id}`, this.editedItem, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            this.initialize()
            this.close()
          } else {
            await axios.post("https://localhost:4000/responsable", this.editedItem, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            this.initialize()
            this.close()
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
      async obtenerActivos(){
        const activo = await axios.get('https://localhost:4000/activo', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        const dataActivos = activo.data
        const activos = []

        for (const activo of dataActivos) {
          activos.push(activo.descripcion)
        }

        this.activos = activos
      },
    }, 
  }
</script>