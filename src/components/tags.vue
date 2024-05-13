<template>
    <v-data-table :headers="headers" :items="tags">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Tags</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="600px">
            <template v-slot:activator="{ props }">
              <v-btn class="mb-2" color="primary" dark v-bind="props">
                Nuevo tag
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
                            v-model="editedItem.tag"
                            label="Tag"
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
        </v-toolbar>
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
        dialogDeleteActivo: false,
        dialogActivo: false,
        dialogDelete: false,
        headers: [
          { title: 'ID', sortable: false, key: 'id' },
          { title: 'Tag', sortable: false, key: 'tag' },
          { title: 'Activos', sortable: false, key: 'activos' },
          { title: 'Accion', sortable: false, key: 'actions'}
        ],
        tags: [],
        editedIndex: -1,
        editedItem: {},
        defaultItem: {},
        activos: [],
        activo: {},
        token : useStore().state.token
      }),
  
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'Nuevo tag' : 'Tag a editar'
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
            const tagsRecibidos = await axios.get('https://localhost:4000/tag', {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            const tagsProcesados = [];
  
            for (const tag of tagsRecibidos.data) {
              const activos = await axios.get(`https://localhost:4000/tag/${tag.id}/activos`, {
                headers: {
                  Authorization: `Bearer ${this.token}`
                }
              })
  
              if(activos.data.length != 0) {
                tag.activos = activos.data.map(activo => activo.descripcion).join(', ')
              }
  
              tagsProcesados.push(tag);
            }
            await this.obtenerActivos()
            this.tags = tagsProcesados;
          } catch (error) {
            console.error('Error initializing:', error);
          }
        },
  
        editItem (item) {
          this.editedIndex = this.tags.indexOf(item)
          this.editedItem = Object.assign({}, item)
          if(this.editedItem.imagen != null) this.editedItem.imagen = item.imagen.data 
          if(this.editedItem.activos != undefined) this.editedItem.activos = item.activos.split(', ')
          this.dialog = true
        },
  
        deleteItem(item) {
          this.dialogDelete = true
          this.editedIndex = this.tags.indexOf(item);
          this.editedItem = this.tags[this.editedIndex];
        },
  
        async deleteItemConfirm () {
          await axios.delete(`https://localhost:4000/tag/${this.editedItem.id}`, {
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
            const activos = await axios.get(`https://localhost:4000/tag/${this.editedItem.id}/activos`, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            for (let i = 0; i < activos.data.length; i++) {
              let activo = activos.data[i];
              axios.put(`https://localhost:4000/activo/${activo.id}/borrarTag/${this.editedItem.id}`, {
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
            const id = this.tags[this.editedIndex].id;
            await axios.put(`https://localhost:4000/tag/${id}`, this.editedItem, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            this.initialize();
            this.close();
  
          } else {
            await axios.post("https://localhost:4000/tag", this.editedItem, {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            })
            this.initialize();
            this.close();
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