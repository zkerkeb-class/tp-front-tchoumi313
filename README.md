# Fonctionnalités Frontend

## Ce qui était demandé

- liste paginée, 
- affichage d'un Pokémon, 
- création, 
- modification et suppression.

## Ce que j'ai ajouté

### Comparaison de Pokémon
On peut comparer deux Pokémon côte à côte avec leurs stats en barres, un indicateur de gagnant, et les différences de stats 

### Suppression multiple
Au lieu de supprimer un par un, j'ai mis des cases à cocher pour en supprimer plusieurs d'un coup.

### Duplication
Un bouton pour dupliquer un Pokémon rapidement, ça crée une copie avec "(copy)" ajouté au nom.

### Système d'équipes (route `/team`)
J'ai créé un système pour créer des équipes de 6 Pokémon max. On peut les sauvegarder avec un nom, les recharger plus tard, ou les supprimer. Tout est sauvegardé en base de données.

### Simulateur de combat (route `/fight`)
Un mini-jeu où deux Pokémon se battent tour par tour. Le plus rapide attaque en premier, et les dégâts dépendent de l'Attaque et de la Défense.

### Filtres et tri
J'ai ajouté un filtre par type (Fire, Water, etc.) et plusieurs options de tri (nom, HP, attaque, etc.). Le filtre est géré côté backend pour que la pagination marche bien.

### Upload d'images
Possibilité d'uploader une image quand tu crées un Pokémon, avec une prévisualisation avant l'envoi.

**Vidéo démo:** https://youtu.be/NcBpNu44ENA
**Vidéo de la mise a jour UI + OIDC Auth:** https://youtu.be/NZ4H3JZkxg8

