<template>
  <v-app>
    <v-container fluid>
      <v-app-bar
          color="orange accent-4"
          dense
          dark
      >
        <v-spacer/>
        <v-btn outlined class="ml-3">Главная</v-btn>
        <v-btn outlined class="ml-3">Фотографии</v-btn>
      </v-app-bar>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>

</style>