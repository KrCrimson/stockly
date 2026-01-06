📋 CUADRO DE REQUERIMIENTOS – SISTEMA DE INVENTARIO SIMPLE
Código	Requerimiento	Importancia (1–10)	Prerrequisito
RQ-01	Registro de productos	10	—
RQ-02	Campos básicos del producto (nombre, código, stock inicial)	10	RQ-01
RQ-03	Actualización de datos del producto	8	RQ-01
RQ-04	Registro de entradas de stock	10	RQ-01
RQ-05	Registro de salidas de stock	10	RQ-01
RQ-06	Validación de stock suficiente antes de salida	10	RQ-05
RQ-07	Cálculo automático de stock actual	10	RQ-04, RQ-05
RQ-08	Historial de movimientos de stock	9	RQ-04, RQ-05
RQ-09	Soft delete de productos	8	RQ-01
RQ-10	Estados del producto (activo / inactivo / agotado)	8	RQ-07
RQ-11	Alerta de stock mínimo	7	RQ-07
RQ-12	Listado de productos con stock actual	10	RQ-07
RQ-13	Filtro de productos por estado	6	RQ-12
RQ-14	Registro de fecha y usuario en movimientos	7	RQ-08
RQ-15	Reporte simple de movimientos por producto	6	RQ-08
🧠 EXPLICACIÓN DE CÓMO DEBERÍA FUNCIONAR EL SISTEMA
🔹 1️⃣ Concepto base

El sistema NO modifica el stock directamente.
El stock siempre se calcula a partir de movimientos.

Esto es clave y lo hace más profesional.

🔹 2️⃣ Productos

Cada producto tiene:

nombre

código único

stock mínimo

estado (activo / inactivo / agotado)

fecha de creación

estado lógico (soft delete)

El producto no guarda el stock como verdad absoluta, solo como valor calculado o cacheado.

🔹 3️⃣ Movimientos de stock (el corazón del sistema)

Existen dos tipos:

entrada

salida

Cada movimiento registra:

productoId

tipo (entrada / salida)

cantidad

motivo (compra, ajuste, venta, etc.)

fecha

estado

👉 Nunca se edita un movimiento, si hay error se registra otro movimiento de corrección.

🔹 4️⃣ Regla crítica (nivel 2 real)

Antes de registrar una salida, el sistema debe:

Calcular stock actual del producto

Verificar si stockActual >= cantidadSalida

Si no alcanza → rechazar la operación

Esta validación va en el use case, no en el controlador.

🔹 5️⃣ Cálculo de stock

El stock se calcula así:

stock = SUM(entradas) - SUM(salidas)


Opcionalmente puedes:

cachear el stock en el producto

recalcularlo periódicamente

recalcularlo bajo demanda

Pero la fuente de verdad siempre son los movimientos.

🔹 6️⃣ Estados automáticos

El sistema puede cambiar estados solo:

stock = 0 → producto = “agotado”

stock > 0 → producto = “activo”

soft delete → “inactivo”

Esto no lo decide el frontend, lo decide el backend.

🔹 7️⃣ Alertas de stock mínimo

Cuando:

stockActual <= stockMinimo


El sistema:

marca el producto en alerta

lo devuelve en listados especiales

(opcional) registra evento/log

No necesitas notificaciones externas todavía.

🔹 8️⃣ Historial (muy importante)

Todo queda registrado:

qué producto

qué cantidad

qué tipo

cuándo

por qué

Esto te permite:

auditoría

correcciones

reportes

confianza en los datos

🔹 9️⃣ Soft delete

Si un producto se “borra”:

no desaparece

no acepta nuevos movimientos

sigue visible en historial

Regla fuerte de backend.

🔹 🔟 Por qué este proyecto sube tu nivel

Porque aquí practicas:

reglas de negocio reales

validaciones duras

consistencia de datos

arquitectura limpia de verdad

decisiones backend, no UI

🏁 Resumen rápido

No es solo CRUD

El stock no se edita, se calcula

Los movimientos son la verdad

El backend manda

Clean Architecture encaja perfecto