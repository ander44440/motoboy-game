export const base44 = {
  auth: {
    me: async () => ({
      email: "teste@teste.com",
      full_name: "Jogador"
    }),
  },

  entities: {
    Player: {
      filter: async () => [],
      create: async (data) => data,
      update: async () => {},
    },

    MotoSkin: {
      list: async () => [],
    },

    RaceHistory: {
      filter: async () => [],
    },
  },
};