import Swal from 'sweetalert2';

if (!window.__fetchInterceptorAttached) {
  window.__fetchInterceptorAttached = true;
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      if (response.status === 401) {
        const currentPath = window.location.pathname;
        const lowerPath = currentPath.toLowerCase();
        
        const exclusions = ['/', 'welcome', 'confirmarcita', 'recuperarcontrasena'];
        const shouldExclude = exclusions.some(path => lowerPath === path || lowerPath.includes(path));

        if (shouldExclude) {
          return response;
        }
        
        if (lowerPath.includes('/catalogo/')) {
          Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'Inicia sesión o regístrate para agendar.',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = '/';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Sesión expirada o no iniciada',
            text: 'Por favor, inicia sesión para continuar.',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = '/';
          });
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };
}
