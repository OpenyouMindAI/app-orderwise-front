export const validationSession = async (to, from, next) => {
  const validation = localStorage.getItem('accessToken') && localStorage.getItem('user')
  if (!validation) {
    return next('/login')
  }
  // const roles = JSON.parse(localStorage.getItem('user')).roles
  // const modules = []
  // roles.forEach(role => {
  //   role.modules.forEach(module => {
  //     modules.push(module)
  //   })
  // })
  // const moduleFind = modules.find(module => module.route === to.name)
  // const root = localStorage.getItem('root')
  // if (from.name === 'login') {
  //   return next()
  // }
  return next()
  // clearTimeout(localStorage.getItem('timeOut'))
  // next()
}

export const validationNotSession = async (to, from, next) => {
  const validation = localStorage.getItem('accessToken') && localStorage.getItem('email')
  if (validation) {
    return next('/')
  }
  next()
}
