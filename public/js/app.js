// public/js/app.js

// Obtener el ID del carrito desde un atributo data en el body o meta
const cartId = document.body.dataset.cartId || 'ID_DEL_CARRITO';

// Función para agregar producto al carrito
async function addToCart(productId) {
  try {
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: 'POST'
    });

    if (res.ok) {
      alert('✅ Producto agregado al carrito');
    } else {
      const data = await res.json();
      alert(`❌ Error: ${data.message || 'No se pudo agregar el producto'}`);
    }
  } catch (error) {
    console.error(error);
    alert('❌ Error de conexión al agregar el producto');
  }
}

// Seleccionar todos los botones "Agregar al carrito"
document.querySelectorAll('.product-card button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const productId = button.dataset.productId;
    addToCart(productId);
  });
});
