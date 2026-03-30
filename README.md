<h1 align="center">⏰ Horalista</h1>

<p align="center">
Sistema de gestión de citas para barberos y estilistas
</p>

<p align="center">
  <img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774533107/Video_Project_2_dpvpnn.gif" width="750" alt="Horalista Demo"/>
</p>

---

Hola, mi nombre es *25JT*, creador de este proyecto el cual gestiona citas de diferentes barberos o estilistas femeninas.  
La idea partió de la universidad, en la cual a mí y a un compañero no nos gustaba esperar para ser atendidos en una barbería, sino que preferíamos llegar al momento exacto y recibir el servicio.  

Al ver que nadie usaba este tipo de herramientas decidí, ya por mi cuenta después de graduarme, darle vida a la idea que habíamos tenido.

Esta herramienta actualmente considero que es un producto mínimo viable *(MVP)*, ya que hay muchas funciones que por el momento no están desarrolladas como estadísticas, pagos en la aplicación, etc.  

Pienso agregarlo en el futuro, pero por ahora busco el feedback de posibles usuarios. La aplicación a día de hoy no ha sido desplegada y continúa en pruebas hechas por mí. También existe el factor monetario.

Este proyecto ha sido desarrollado de forma independiente durante aproximadamente 9 meses, iterando funcionalidades, mejorando la experiencia de usuario y optimizando la arquitectura del sistema.

---

# 🏗️ Arquitectura

El proyecto está dividido en:

- Frontend (este repositorio)  
- Backend (API REST + Socket.io)  
- Base de datos MySQL con 11 tablas  a día de hoy. 

El frontend se comunica mediante llamadas HTTP y WebSocket al servidor.

---

# 🛠️ Funciones

- Vinculación en tiempo real y vista en tiempo real de sus citas y cambios de estados  
- Gestión completa de citas con rango de horarios y personalización total  
- Modificación del horario en cualquier momento (solo citas futuras no agendadas)  
- Recordatorios automáticos por servidor mediante correo  
- Validación de correo al registrarse, recuperación de contraseñas  
- Vinculación opcional con WhatsApp para enviar recordatorios (el servidor se encarga del envío automáticamente)  
- Mantiene sesión abierta 24h  renueva el token con cada ves que se abra la seccion
- guías básicas sobre las funciones mas importantes en la aplicación   
- Sistema de calificación por estrellas para negocios
- Vista "Tu página" con logo y banner con previsualización tiempo real, el usuario puede subir la imagen que desee  
- Catálogo con hasta 6 servicios personalizados  
- Cada servicio soporta 3 imágenes con previsualización tiempo real  

---

## 🖥️ Servidor

<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774533687/e7d59152-3dde-4553-ab70-08ceefc2dee1.png" width="300"/>
</p>

<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774533691/df26f7c4-f721-464e-8084-951d047b5c1c.png" width="750"/>
</p>

<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774563649/4013fd2f-52cd-44d0-8493-c3e4a51adc41.png" width="750"/>
</p>



---

## 🗄️ Diagrama de base de datos

<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774532743/Captura_de_pantalla_2026-03-25_184620_bg0rwc.png" width="750"/>
</p>
esta es solo una muestra aproximada de como esta echa.


---

La aplicación por el momento funciona solo en horario *Colombia*, ya que es donde se piensa desplegar y posteriormente expandir.  
Soporta números extranjeros para la función de WhatsApp, pero la gestión de la cita se realiza en **UTC-05:00**.

---

## 🎬 Algunas demostraciones

### Registro de negocio
<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774532236/Registro_negocio_httpsfiles.catbox.moeaq18ki.gif_ymfgfz.gif" width="750"/>
</p>

### Guías para nuevos usuarios
<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774532236/tutoriales_fq1qin.gif" width="750"/>
</p>

### Funcionalidades para el profesional
<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774532236/paseo_menus_slider_bar_sr0fya.gif" width="750"/>
</p>

### Agendamie de una cita y calificacion

<p align="center">
<img src="https://res.cloudinary.com/dzxhmzo6l/image/upload/v1774565088/Video_Project_3_xsrdie.gif" width="750"/>
</p>
---

## 🛠️ Tecnologías

<div align="center">

| Backend | Frontend | Servicios | Otros |
|--------|---------|-----------|------|
| Node.js | HTML / CSS / JS | Cloudinary | QRCode |
| Express | Tailwind | Google APIs | Node-cron |
| MySQL | Astro | Baileys | DriveJs |
| Socket.io |React  | CubePath  | Gsap |

</div>

---

## 📸 Demo

Link demo:  
http://horalista-front-horalista-smm1kj-d78a61-157-254-174-80.traefik.me/

**Usuario De prueba por si no quieres hacer todo el proceso de registro y validación de correo**

**User1:**
Usuariopa1@gmail.com 
Contraseña
12345678

**User2 profesional:**
Usuariopa2@gmail.com 
Contraseña
12345678

Aquí me gustaria mencionar que todo esto es posible en gran parte gracias al jscamp jaja aprendí mucho.

---

## ☁️ Cómo utilicé CubePath

La primera fase fue entender sus menús y cómo funciona su dashboard. La verdad no fue muy complejo, considero que fue bastante sencillo.  

Luego procedí a abrir un servidor con **Dokploy**, ya que tiene la funcionalidad de **Railpack**, con la que tengo más familiaridad. Busqué un tutorial sobre cómo desplegar en Dokploy, ya que nunca antes lo había realizado.  

Aprendí a hacerlo desde 0, vinculé mi cuenta de GitHub, realicé el clon de los repositorios y desplegué con bastante facilidad.

Para la base de datos en mysql si realice toda la creación igual que como cuando cree los anteriores la diferencia fue que este no me permitía conectar con mysql workbench y todo era porque mi puerto funcionaba internamente pero claro yo no me di cuenta hasta que me agarre a leer detenidamente, una vez realice y puse mi puerto para volver a ingresar. funciono y realice la subida de la bd como tengo acostumbrado y listo.  

Una vez hecho eso comencé a hacer pruebas de funcionamiento y a verificar cuánto consumía mi servidor y el frontend.

en conclusión mi experiencia con cubepath fue muy buena la verdad fue extremadamente sencillo de poner el server en funcionamiento  y conectarme a el con ssh aunque no lo use prácticamente ya que el  dashboard te brinda todo desde afuera,  fueron dos clicks y listo. 

---