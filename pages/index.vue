<template>
  <Gallery
    :card-data="cardData"
    :options="{
      gridRows: 5,
      gridCols: 5,
      tileSize: 3
    }" />
</template>

<script setup lang="ts">
const cardData = [
  {
    title: 'Project Alpha',
    badge: 'New',
    description: 'Revolutionary AI-powered analytics platform for enterprise solutions',
    tags: ['AI', 'Analytics', 'SaaS'],
    date: 'Jan 15, 2024'
  },
  {
    title: 'Design System',
    badge: 'Updated',
    description: 'Comprehensive component library with modern UI patterns',
    tags: ['Design', 'UI/UX', 'React'],
    date: 'Jan 10, 2024'
  },
  {
    title: 'Mobile App',
    badge: 'Beta',
    description: 'Cross-platform mobile application with native performance',
    tags: ['Mobile', 'React Native'],
    date: 'Jan 08, 2024'
  },
  {
    title: 'API Gateway',
    badge: 'Stable',
    description: 'High-performance API management and routing system',
    tags: ['Backend', 'API', 'Node.js'],
    date: 'Jan 05, 2024'
  },
  {
    title: 'Dashboard',
    badge: 'Live',
    description: 'Real-time monitoring dashboard with advanced analytics',
    tags: ['Frontend', 'Vue.js', 'Charts'],
    date: 'Jan 03, 2024'
  },
  {
    title: 'Database',
    badge: 'Optimized',
    description: 'Scalable database architecture with improved performance',
    tags: ['Database', 'PostgreSQL'],
    date: 'Jan 01, 2024'
  },
  {
    title: 'Security',
    badge: 'Critical',
    description: 'Enhanced security framework with multi-factor auth',
    tags: ['Security', 'Auth', 'JWT'],
    date: 'Dec 28, 2023'
  },
  {
    title: 'DevOps',
    badge: 'Automated',
    description: 'CI/CD pipeline implementation with Docker containers',
    tags: ['DevOps', 'Docker', 'K8s'],
    date: 'Dec 25, 2023'
  },
  {
    title: 'Testing',
    badge: 'Complete',
    description: 'Comprehensive testing suite with automated coverage',
    tags: ['Testing', 'Jest', 'Cypress'],
    date: 'Dec 20, 2023'
  },
  {
    title: 'Project Alpha',
    badge: 'New',
    description: 'Revolutionary AI-powered analytics platform for enterprise solutions',
    tags: ['AI', 'Analytics', 'SaaS'],
    date: 'Jan 15, 2024'
  },
  {
    title: 'Design System',
    badge: 'Updated',
    description: 'Comprehensive component library with modern UI patterns',
    tags: ['Design', 'UI/UX', 'React'],
    date: 'Jan 10, 2024'
  },
  {
    title: 'Mobile App',
    badge: 'Beta',
    description: 'Cross-platform mobile application with native performance',
    tags: ['Mobile', 'React Native'],
    date: 'Jan 08, 2024'
  },
  {
    title: 'API Gateway',
    badge: 'Stable',
    description: 'High-performance API management and routing system',
    tags: ['Backend', 'API', 'Node.js'],
    date: 'Jan 05, 2024'
  },
  {
    title: 'Dashboard',
    badge: 'Live',
    description: 'Real-time monitoring dashboard with advanced analytics',
    tags: ['Frontend', 'Vue.js', 'Charts'],
    date: 'Jan 03, 2024'
  },
  {
    title: 'Database',
    badge: 'Optimized',
    description: 'Scalable database architecture with improved performance',
    tags: ['Database', 'PostgreSQL'],
    date: 'Jan 01, 2024'
  },
  {
    title: 'Security',
    badge: 'Critical',
    description: 'Enhanced security framework with multi-factor auth',
    tags: ['Security', 'Auth', 'JWT'],
    date: 'Dec 28, 2023'
  },
  {
    title: 'DevOps',
    badge: 'Automated',
    description: 'CI/CD pipeline implementation with Docker containers',
    tags: ['DevOps', 'Docker', 'K8s'],
    date: 'Dec 25, 2023'
  },
  {
    title: 'Testing',
    badge: 'Complete',
    description: 'Comprehensive testing suite with automated coverage',
    tags: ['Testing', 'Jest', 'Cypress'],
    date: 'Dec 20, 2023'
  }
];

const config: GalleryConfig = {
  cellSize: 0.75,
  zoomLevel: 1.25,
  lerpFactor: 0.075,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderColor: 'rgba(255,255,255,0.15)',
  textColor: 'rgba(128,128,128,1)',
  hoverColor: 'rgba(255,255,255,0)',
  dragSensitivity: 1000
};
</script>
