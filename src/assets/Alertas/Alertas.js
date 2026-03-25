
import Swal from 'sweetalert2';

export function alertaCheck(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });
}

export function alertaCheckReload(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    window.location.reload();
  });
}

export function alertaFallo(mensaje) {
  Swal.fire({
    icon: "error",
    title: "¡Error!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });

}

export function alertaFalloDesaparece(mensaje) {
  Swal.fire({
    icon: "error",
    title: "¡Error!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });
  //quitar alerta despues de 2 segundos
  setTimeout(() => {
    Swal.close();
  }, 2000);
}

export function alertaMal(mensaje) {
  Swal.fire({
    icon: "warning",
    title: "¡Atención!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });
}

export function alertaMal2(mensaje) {
  Swal.fire({
    icon: "warning",
    title: "¡Atención!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/TuPagina";
  });
}


export function alertaCheck2(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/";
  });
}



export function alertaFallo2(mensaje) {
  Swal.fire({
    icon: "error",
    title: "¡Error!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/";
  });
}

export function alertaCheck3(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/MenuNegocio";
  });
}

export function alertaCheck4(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/CitasAgendadas";
  });
}

export function alertaCheck5(mensaje) {
  Swal.fire({
    icon: "success",
    title: "¡Correcto!",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  }).then(() => {
    location.href = "/MenuNegocio";
  });
}

export async function alertaConfirm(mensaje) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí",
    cancelButtonText: "No"
  });

  return result.isConfirmed;
}
