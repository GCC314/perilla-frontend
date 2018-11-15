import { problemRoutes } from './problem'
import { RouteConfig } from 'vue-router'
import home from '../views/home.vue'
import about from '../views/about.vue'
import login from '../views/login.vue'
import logout from '../views/logout.vue'
import error from '../views/error.vue'
import register from '../views/register.vue'
import { fileRoutes } from './file'
import { solutionRoutes } from './solution'

let routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: home
  },
  {
    path: '/about',
    name: 'about',
    component: about
  },
  {
    path: '/login',
    name: 'login',
    component: login
  },
  {
    path: '/logout',
    name: 'logout',
    component: logout
  },
  {
    path: '/register',
    name: 'register',
    component: register
  }
]
routes = routes.concat(problemRoutes)
routes = routes.concat(fileRoutes)
routes = routes.concat(solutionRoutes)
routes.push({
  path: '*',
  name: 'error',
  component: error
})

export default routes
