# mix-doors-app

Base "App Engine + Door Packs" pour expérimenter des portes dans un bundle Vite minimaliste. L'engine reste agnostique des packs et charge uniquement ce qui est enregistré dans le registre central.

## Démarrer

```bash
npm install
npm run dev
```

L'application démarre avec la porte `_template` et affiche une sidebar, un runbar et un contenu minimal.

## Ajouter une porte

1. Copier le dossier `doors/_template` vers `doors/Pxx` (ex: `P15`).
2. Adapter les placeholders dans les JSON/HTML de la nouvelle porte.
3. Enregistrer la porte dans `app/domain/doorpacks.js` pour que l'engine puisse la charger.

## Philosophie

- **Séparation stricte** entre l'engine (`app/`) et les données de porte (`doors/`).
- **Bundles statiques** : aucun fetch runtime pour charger les packs ou les ressources.
- **Montage dynamique** : la navigation, les mounts et le drawer sont générés depuis les données du pack actif.
