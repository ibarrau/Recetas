# Sabores de Casa

Sitio de recetas hecho con Jekyll, preparado para GitHub Pages.

## Añadir una receta

Crea un archivo Markdown dentro de `_recipes/` con front matter como este:

```md
---
title: "Nombre de la receta"
date: 2026-05-16
description: "Breve descripción"
category: "Categoría"
image: /assets/images/mi-imagen.jpg
prep_time: "15 min"
cook_time: "20 min"
total_time: "35 min"
servings: "4 personas"
difficulty: "Fácil"
author: "Tu nombre"
tags:
  - casera
  - rápida
---

## Ingredientes

- ingrediente 1
- ingrediente 2

## Preparación

1. Paso 1
2. Paso 2
```

## Ejecutar en local

```bash
bundle install
bundle exec jekyll serve
```