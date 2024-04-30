<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
      app
      expand-on-hover
      rail
      >
        <v-list>
          <v-list-item
            prepend-avatar="https://comunicacioninstitucional.uabc.mx/sites/default/files/inline-images/escudo-actualizado-2022.png"
            title="Gestor de activos"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" router>
          <v-list-item prepend-icon="mdi-devices" to="/" title="Activos"></v-list-item>
          <v-list-item prepend-icon="mdi-account-outline" to="/responsables" title="Responsables"></v-list-item>
          <v-list-item prepend-icon="mdi-map-marker-outline" to="/ubicaciones" title="Ubicaciones"></v-list-item>
          <v-list-item prepend-icon="mdi-tag-outline" to="/tags" title="Tags"></v-list-item>
        </v-list>
        
      </v-navigation-drawer>

      <v-main>
        <router-view />
      </v-main>

    </v-layout>
  </v-card>
</template>

<script setup>
  //
</script>