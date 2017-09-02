/**
 * Immutable map helper. All operations return new map copied from previous map.
 */
const EntityMap = {
  /**
   * Create new entity map from given array.
   *
   * @param {array} entities
   * @param {string} keyPropName
   * @return {object}
   */
  fromArray(entities, keyPropName = 'id') {
    return EntityMap.merge({ byKey: {}, keys: [] }, entities, keyPropName)
  },
  /**
   * Merge given entities into given map.
   *
   * @param {object} source
   * @param {array} entities
   * @return {object}
   */
  merge(source, entities, keyPropName = 'id') {
    return {
      byKey: {
        ...source.byKey,
        ...entities.reduce((acc, entity) => {
          acc[entity[keyPropName]] = entity
          return acc
        }, {})
      },
      keys: [
        ...new Set(
          source.keys.concat(entities.map(entity => entity[keyPropName]))
        )
      ]
    }
  },
  /**
   * Set given entity in map.
   *
   * @param {object} source
   * @param {striobjectng} entity
   */
  set(source, entity, keyPropName = 'id') {
    return EntityMap.merge(source, [entity], keyPropName)
  },
  /**
   * Remove value by given key.
   *
   * @param {object} source
   * @param {string} key
   * @return {object}
   */
  remove(source, key) {
    if (!source.byKey || !source.byKey[key]) return source

    const keys = source.keys.filter(originalKey => originalKey !== key)
    return {
      byKey: keys.reduce((acc, key) => {
        acc[key] = source.byKey[key]
        return acc
      }, {}),
      keys
    }
  },
  /**
   * Retrieve value by given key.
   *
   * @param {object} source
   * @param {string} key
   */
  get(source, key, fallback = {}) {
    return (source.byKey && source.byKey[key]) || fallback
  },
  /**
   * Map over all entities with given function and return array with results.
   *
   * @param {object} source
   * @param {function} fn
   * @param {array}
   */
  map(source, fn) {
    return source.keys.map(key => fn(source.byKey[key], key))
  },
  /**
   * Apply given function to all entities and return new map with results.
   *
   * @param {object} source
   * @param {function} fn
   * @return {object}
   */
  apply(source, fn) {
    return {
      byKey: source.keys.reduce((acc, key) => {
        acc[key] = fn(source.byKey[key], key)
        return acc
      }, {}),
      keys: source.keys
    }
  }
}

export default EntityMap