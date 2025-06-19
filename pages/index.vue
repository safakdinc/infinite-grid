<template>
  <Gallery
    :card-data="cardData"
    :options="{
      gridRows: 4,
      gridCols: 4,
      tileSize: 2.4,
      baseCameraZ: 10
    }" />
</template>

<script setup lang="ts">
const cardData = [
  {
    title: 'Project Alpha',
    badge: 'New',
    image: 'https://images.pexels.com/photos/29214035/pexels-photo-29214035.jpeg',
    description: 'Revolutionary AI-powered analytics platform for enterprise solutions',
    tags: ['AI', 'Analytics', 'SaaS'],
    date: '2024'
  },
  {
    title: 'Design System',
    badge: 'Updated',
    description: 'Comprehensive component library with modern UI patterns',
    image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg',
    tags: ['Design', 'UI/UX', 'React'],
    date: '2024'
  },
  {
    title: 'Mobile App',
    badge: 'Beta',
    image: 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.png',
    description: 'Cross-platform mobile application with native performance',
    tags: ['Mobile', 'React Native'],
    date: '2024'
  },
  {
    title: 'API Gateway',
    badge: 'Stable',
    image: 'https://images.pexels.com/photos/2881262/pexels-photo-2881262.jpeg',
    description: 'High-performance API management and routing system',
    tags: ['Backend', 'API', 'Node.js'],
    date: '2024'
  },
  {
    title: 'Dashboard',
    badge: 'Live',
    image: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg',
    description: 'Real-time monitoring dashboard with advanced analytics',
    tags: ['Frontend', 'Vue.js', 'Charts'],
    date: '2024'
  },
  {
    title: 'Database',
    badge: 'Optimized',
    image: 'https://images.pexels.com/photos/1910236/pexels-photo-1910236.jpeg',
    description: 'Scalable database architecture with improved performance',
    tags: ['Database', 'PostgreSQL'],
    date: '2024'
  },
  {
    title: 'Security',
    badge: 'Critical',
    image: 'https://images.pexels.com/photos/2471235/pexels-photo-2471235.jpeg',
    description: 'Enhanced security framework with multi-factor auth',
    tags: ['Security', 'Auth', 'JWT'],
    date: '2023'
  },
  {
    title: 'DevOps',
    badge: 'Automated',
    image: 'https://images.pexels.com/photos/1910225/pexels-photo-1910225.jpeg',
    description: 'CI/CD pipeline implementation with Docker containers',
    tags: ['DevOps', 'Docker', 'K8s'],
    date: '2023'
  },
  {
    title: 'Testing',
    badge: 'Complete',
    image: 'https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg',
    description: 'Comprehensive testing suite with automated coverage',
    tags: ['Testing', 'Jest', 'Cypress'],
    date: '2023'
  },
  {
    title: 'Project Alpha',
    badge: 'New',
    image: 'https://images.pexels.com/photos/3109830/pexels-photo-3109830.jpeg',
    description: 'Revolutionary AI-powered analytics platform for enterprise solutions',
    tags: ['AI', 'Analytics', 'SaaS'],
    date: '2024'
  },
  {
    title: 'Design System',
    badge: 'Updated',
    image: 'https://images.pexels.com/photos/3308588/pexels-photo-3308588.jpeg',
    description: 'Comprehensive component library with modern UI patterns',
    tags: ['Design', 'UI/UX', 'React'],
    date: '2024'
  },
  {
    title: 'Mobile App',
    badge: 'Beta',
    image: 'https://images.pexels.com/photos/1149019/pexels-photo-1149019.jpeg',
    description: 'Cross-platform mobile application with native performance',
    tags: ['Mobile', 'React Native'],
    date: '2024'
  },
  {
    title: 'API Gateway',
    badge: 'Stable',
    image: 'https://images.pexels.com/photos/604684/pexels-photo-604684.jpeg',
    description: 'High-performance API management and routing system',
    tags: ['Backend', 'API', 'Node.js'],
    date: '2024'
  },
  {
    title: 'Dashboard',
    badge: 'Live',
    image: 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg',
    description: 'Real-time monitoring dashboard with advanced analytics',
    tags: ['Frontend', 'Vue.js', 'Charts'],
    date: '2024'
  },
  {
    title: 'Database',
    badge: 'Optimized',
    image: 'https://images.pexels.com/photos/1910231/pexels-photo-1910231.jpeg',
    description: 'Scalable database architecture with improved performance',
    tags: ['Database', 'PostgreSQL'],
    date: '2024'
  },
  {
    title: 'Security',
    badge: 'Critical',
    image: 'https://images.pexels.com/photos/2860807/pexels-photo-2860807.jpeg',
    description: 'Enhanced security framework with multi-factor auth',
    tags: ['Security', 'Auth', 'JWT'],
    date: '2023'
  },
  {
    title: 'DevOps',
    badge: 'Automated',
    image: 'https://images.pexels.com/photos/1293125/pexels-photo-1293125.jpeg',
    description: 'CI/CD pipeline implementation with Docker containers',
    tags: ['DevOps', 'Docker', 'K8s'],
    date: '2023'
  },
  {
    title: 'Testing',
    badge: 'Complete',
    image: 'https://images.pexels.com/photos/1910230/pexels-photo-1910230.jpeg',
    description: 'Comprehensive testing suite with automated coverage',
    tags: ['Testing', 'Jest', 'Cypress'],
    date: '2023'
  }
];
</script>
