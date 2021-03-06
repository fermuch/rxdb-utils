export default {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      const prevCollection = proto.collection;
      Object.assign(proto, {
        async collection(model, ...other) {
          const timestamps = model && model.options && model.options.timestamps;

          const collection = await prevCollection.call(this, model, other);
          if (!timestamps) return collection;

          // Register hooks
          collection.preInsert((data) => {
            const now = new Date().toISOString();
            if (!data.createdAt) data.createdAt = now;
            if (!data.updatedAt) data.updatedAt = now;

            return data;
          });

          collection.preSave((data, doc) => {
            if (!data.updatedAt) data.updatedAt = new Date().toISOString();
            return data;
          });

          return collection;
        }
      });
    }
  },
  overwritable: {},
  hooks: {
    preCreateRxCollection(model) {
      const timestamps = model && model.options && model.options.timestamps;
      if (!timestamps) return model;

      // Set schema
      if (!model.schema) model.schema = {};
      if (!model.schema.properties) model.schema.properties = {};
      model.schema.properties.createdAt = model.schema.properties.createdAt || {
        format: 'date-time',
        type: 'string'
      };
      model.schema.properties.updatedAt = model.schema.properties.updatedAt || {
        format: 'date-time',
        type: 'string'
      };

      model.schema.required = (model.schema.required || []).concat([
        'createdAt',
        'updatedAt'
      ]);

      return model;
    }
  }
};
