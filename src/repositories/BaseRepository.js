/**
 * BaseRepository - Clase base para todos los repositorios
 * Proporciona métodos comunes que se reutilizan en todos los repositorios
 */
class BaseRepository {
  constructor(dao) {
    this.dao = dao;
  }

  /**
   * Crear un nuevo documento
   * @param {Object} data - Datos a guardar
   * @returns {Promise} - Documento creado
   */
  async create(data) {
    return await this.dao.create(data);
  }

  /**
   * Obtener documento por ID
   * @param {String} id - ID del documento
   * @param {Object} options - Opciones (populate, lean, etc)
   * @returns {Promise} - Documento encontrado
   */
  async findById(id, options = {}) {
    return await this.dao.findById(id, options);
  }

  /**
   * Obtener todos los documentos
   * @returns {Promise} - Array de documentos
   */
  async findAll() {
    return await this.dao.findAll();
  }

  /**
   * Actualizar documento por ID
   * @param {String} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} - Documento actualizado
   */
  async updateById(id, data) {
    return await this.dao.updateById(id, data);
  }

  /**
   * Eliminar documento por ID
   * @param {String} id - ID del documento
   * @returns {Promise} - Documento eliminado
   */
  async deleteById(id) {
    return await this.dao.deleteById(id);
  }

  /**
   * Contar documentos que cumplan condiciones
   * @param {Object} filter - Filtros
   * @returns {Promise<Number>} - Cantidad de documentos
   */
  async count(filter = {}) {
    return await this.dao.count(filter);
  }
}

module.exports = BaseRepository;
