export function validarInicioProfesional() {
    const userid = sessionStorage.getItem("Id");
    const role = sessionStorage.getItem("Role");
    if (role !== "profesional" || !userid) {
        location.href = "/";
    }
}
export function validarInicioCliente() {
    const userid = sessionStorage.getItem("Id");
    const role = sessionStorage.getItem("Role");
    if (role !== "cliente" || !userid) {
        location.href = "/";
    }
}


