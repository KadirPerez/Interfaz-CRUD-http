<template>
  <v-data-table :headers="headers" :items="activos">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Activos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="750px">
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
                      <v-col cols="6">
                        <v-select
                          v-model="editedItem.ubicacion"
                          :items="ubicacionesDisponibles"
                          label="Ubicacion"
                          clearable 
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-select
                          v-model="editedItem.responsable"
                          :items="responsablesDisponibles"
                          label="Responsable"
                          clearable
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-select
                          v-model="editedItem.tags"
                          :items="tagsDisponibles"
                          label="Tag"
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

  export default {
    data: () => ({
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
      responsablesDisponibles: [],
      ubicacionesDisponibles: [],
      tagsDisponibles: [],
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
          await console.log(activosRecibidos)
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

            if(tags.data.length != 0) {
              activo.tags = tags.data.map(tag => tag.tag).join(', ')
            }
            
            activosProcesados.push(activo);
          }
          await this.obtenerEmpleados()
          await this.obtenerUbicaciones()
          await this.obtenerTags()
          
          this.activos = activosProcesados;
        } catch (error) {
          console.error(`Error initializing:${error}`, error);
        }
      },

      editItem (item) {
        this.editedIndex = this.activos.indexOf(item)
        this.editedItem = Object.assign({}, item)
        if(this.editedItem.imagen != null) this.editedItem.imagen = item.imagen.data 
        if(this.editedItem.tags != undefined)this.editedItem.tags = item.tags.split(', ')
        this.dialog = true
      },

      async save() {
     
        await this.editarResponsableUbicacion()
        
        if(this.editedIndex > -1){
          await this.editarTags()
          await axios.put(`https://localhost:4000/activo/${this.editedItem.id}`, this.editedItem)
        } else {
          await axios.post(`https://localhost:4000/activo`, this.editedItem)
        }

        this.close()
        await this.initialize()
      },

      async editarResponsableUbicacion() {
        if(this.editedItem.responsable != null){
          const responsable = await axios.get(`https://localhost:4000/responsable/nombre/${this.editedItem.responsable}`)
          this.editedItem.idResponsable = responsable.data.id
        } else {
          this.editedItem.idResponsable = this.editedItem.responsable
        }
        
        if(this.editedItem.ubicacion != null){
          const ubicacion = await axios.get(`https://localhost:4000/ubicacion/descripcion/${this.editedItem.ubicacion}`)
          this.editedItem.idUbicacion = ubicacion.data.id
        } else {
          this.editedItem.idUbicacion = this.editedItem.ubicacion
        }
      },

      async editarTags() {
        if(this.editedIndex != -1) {
          const tagsAplicados = await axios.get(`https://localhost:4000/activo/${this.editedItem.id}/tags`)
          for (let i = 0; i < tagsAplicados.data.length; i++) {
            let tag = tagsAplicados.data[i];
            axios.put(`https://localhost:4000/activo/${this.editedItem.id}/borrarTag/${tag.id}`)
          }
        }

        if(this.editedItem.tags != undefined) {
          for(const tag of this.editedItem.tags) {
            const respuestaTag = await axios.get(`https://localhost:4000/tag/tag/${tag}`)
            console.log(tag)
            axios.put(`https://localhost:4000/activo/${this.editedItem.id}/tag/${respuestaTag.data.id}`)
          }
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
        await this.initialize()
        await this.closeDelete()
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
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
      }
    }
  }

</script>