export  const populateFavorites = async (fav) => {
  if (!fav) return { dm: [], channels: [] };

  await fav.populate([
    { path: "user.id" },
    { path: "dm.id" },
    { path: "channels.id" },
  ]);

  return {
    dm: fav.dm.map((d) => ({
      _id: d.id?._id,
      name: d.id?.employeeName || d.id?.name ||d.id?.client_name,
      email: d.id?.email,
      photo: d.id?.photo,
      model: d.model,
    })),

    channels: fav.channels.map((c) => ({
      _id: c.id?._id,
      name: c.id?.name,
    })),
  };
};
