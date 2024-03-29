<template>
  <v-data-table :headers="headers" :items="desserts" :sort-by="[{ key: 'calories', order: 'asc' }]">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Interfaz CRUD usando http</v-toolbar-title>
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
                      v-model="editedItem.userName"
                      label="Autor"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.title"
                      label="Titulo"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    sm="6"
                  >
                    <v-text-field
                      v-model="editedItem.body"
                      label="Post"
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
  export default {
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        { title: 'Autor', sortable: false, key: 'userName', },
        { title: 'Titulo', sortable: false, key: 'title' },
        { title: 'Post', sortable: false, key: 'body' },
        { title: 'Accion', sortable: false, key: 'actions' },
      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
        userName: '',
        title: '',
        body: ''
      },
      defaultItem: {
        userId: '',
        title: '',
        body: ''
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
          const [postsResponse, usersResponse] = await Promise.all([
            fetch("https://jsonplaceholder.typicode.com/posts"),
            fetch("https://jsonplaceholder.typicode.com/users")
          ]);

          if (!postsResponse.ok || !usersResponse.ok) {
            throw new Error('Failed to fetch data');
          }

          const posts = await postsResponse.json();
          const users = await usersResponse.json();

          const usersMap = new Map(users.map(user => [user.id, user.name]));

          this.desserts = posts.map(post => ({
            userId: post.userId,
            title: post.title,
            body: post.body,
            userName: usersMap.get(post.userId)
          }));
        } catch (error) {
          console.error('Error initializing:', error);
        }
      },

      editItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      async deleteItem(item) {

        const index = this.desserts.indexOf(item);
        const title = this.desserts[index].title;

        const resp = await fetch(`https://jsonplaceholder.typicode.com/posts/${title}`, {
          method: 'DELETE',
        });

        if (resp.ok) {
          this.editedIndex = this.desserts.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        } else {
          throw new Error('Failed to delete item');
        }
      },

      deleteItemConfirm () {
        this.desserts.splice(this.editedIndex, 1)
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

          Object.assign(this.desserts[this.editedIndex], responseData);
          this.close();

        } else {
          const resp = await fetch("https://jsonplaceholder.typicode.com/posts", {
              method: 'POST',
              body: JSON.stringify({
              userName: this.editedItem.userName,
              title: this.editedItem.title,
              body: this.editedItem.body,
            }),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          });

          const responseData = await resp.json();

          this.desserts.push(responseData);
          this.close();

        }
      },
    },
  }
</script>