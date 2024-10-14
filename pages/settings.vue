<script setup lang="ts">

import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import SettingsCard from '@/components/SettingsCard.vue'


</script>

<template>

    <div class="mx-auto max-w-270">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="`Settings Page`" />
      <!-- Breadcrumb End -->
      <SettingsCard />
    </div>

</template>
