<template>
  <v-data-table :headers="headers" :items="activos">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Cliente con el servidor https creado</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.numero_serie"
                      label="Numero de serie"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.numero_inventario"
                      label="Numero de inventario"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.tipo"
                      label="Tipo"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.decsripcion"
                      label="Descripcion"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.ubicacion"
                      label="Ubicacion"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.responsable"
                      label="Responsable"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.imagen"
                      label="Imagen"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
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
        size="small"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
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
        { title: 'ID', sortable: false, key: 'id', },
        { title: 'Numero de serie', sortable: false, key: 'numero_serie' },
        { title: 'Numero de inventario', sortable: false, key: 'numero_inventario' },
        { title: 'Tipo', sortable: false, key: 'tipo'},
        { title: 'Descripcion', sortable: false, key: 'descripcion'},
        { title: 'Ubicacion', sortable: false, key: 'ubicacion'},
        { title: 'Responsable', sortable: false, key: 'responsable'},
        { title: 'Imagen', sortable: false, key: 'imagen'},
        { title: 'Accion', sortable: false, key: 'actions'}
      ],
      activos: [],
      editedIndex: -1,
      editedItem: {
        id: '',
        numero_serie: '',
        numero_inventario: '',
        tipo: '',
        decsripcion: '',
        ubicacion: '', 
        responsable: '', 
        imagen:'' 
      },
      defaultItem: {
        id: '',
        numero_serie: '',
        numero_inventario: '',
        tipo: '',
        decsripcion: '',
        ubicacion: '', 
        responsable: '', 
        imagen:'' 
      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
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
          const response = await axios.get('https://localhost:4000/activos');
          this.activos = response.data

        } catch (error) {
          console.error('Error initializing:', error);
        }
      },

      editItem (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      async deleteItem(item) {
        const index = this.activos.indexOf(item);
        const id = this.activos[index].id;

        await axios.delete(`https://localhost:4000/activos/:${id}`);
        
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
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
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async save() {
        if (this.editedIndex > -1) {
          const resp = await fetch(`https://jsonplaceholder.typicode.com/posts/1`, {
            method: 'PUT',
            body: JSON.stringify(this.editedItem),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          });
          
          const responseData = await resp.json();

          Object.assign(this.activos[this.editedIndex], responseData);
          this.close();

        } else {
          await axios.post("https://localhost:4000/activos", {
            numero_serie: this.editedItem.numero_serie,
            numero_inventario: this.editedItem.numero_inventario,
            tipo: this.editedItem.tipo,
            decsripcion: this.editedItem.decsripcion,
            ubicacion: this.editedItem.ubicacion, 
            responsable: this.editedItem.responsable, 
            imagen: this.editedItem.imagen 
          });

          this.initialize();

          this.close();
        }
      },
    },
  }
</script>