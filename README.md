# Al engine
## Asset

This is module for asset management for Al engine.

```nashorn js
  const asset = new SpriteAsset(urlToAsset);
  // To start loading you need to call load after creating
  asset.load();
  // You can check if it's still loads
  asset.isLoading();

  // After loading all the asset data will be in [data] field
  asset.data
``` 