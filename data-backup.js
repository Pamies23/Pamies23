/* Copias locales: solo datos de Real Food, sin cuentas ni servicios externos. */
(function (root) {
  "use strict";

  const MAX_BYTES = 5 * 1024 * 1024;
  const FORMAT = "real-food-backup";
  const ID = /^[a-zA-Z0-9_-]{1,100}$/;
  const DATE = /^\d{4}-\d{1,2}-\d{1,2}$/;
  const singletonKeys = new Set([
    "verde.people.v1", "verde.recipes.v1", "verde.profile.v1", "verde.log.v2", "ejercicios_v1"
  ]);
  const scopedKey = /^(verde\.(?:profile\.v1|log\.v2|shopgot\.v1)|ejercicios_v1)\.([a-zA-Z0-9_-]{1,100})$/;
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const isNumber = value => typeof value === "number" && Number.isFinite(value) && value >= 0;
  const isText = value => typeof value === "string";
  const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const knownKey = key => singletonKeys.has(key) || scopedKey.test(key);
  const check = (condition, message) => { if (!condition) throw new Error(message); };

  // Reject dangerous object keys before any value reaches the application's object merges.
  function checkTree(value, depth = 0) {
    check(depth <= 32, "La copia contiene datos demasiado anidados.");
    if (value === null || typeof value === "boolean" || isText(value)) return;
    if (typeof value === "number") { check(Number.isFinite(value), "La copia contiene un número no válido."); return; }
    check(typeof value === "object", "La copia contiene datos no válidos.");
    Object.keys(value).forEach(key => {
      check(!["__proto__", "prototype", "constructor"].includes(key), "La copia contiene una clave no permitida.");
      checkTree(value[key], depth + 1);
    });
  }

  function checkItems(items, meals) {
    check(Array.isArray(items), "La lista de alimentos no es válida.");
    items.forEach(item => {
      check(isRecord(item) && isText(item.food) && ID.test(item.food) && isNumber(item.grams), "Hay un alimento no válido en la copia.");
      if (meals) check(isText(item.time), "El momento de una comida no es válido.");
    });
  }

  function checkExercises(exercises) {
    check(Array.isArray(exercises), "La lista de ejercicios no es válida.");
    exercises.forEach(exercise => {
      check(isRecord(exercise) && isText(exercise.nombre) && isNumber(exercise.series), "Hay un ejercicio no válido en la copia.");
      check(isText(exercise.reps) || isNumber(exercise.reps), "Las repeticiones no son válidas.");
      if (has(exercise, "descanso")) check(isText(exercise.descanso) || isNumber(exercise.descanso), "El descanso no es válido.");
    });
  }

  function checkValue(key, value) {
    if (key.startsWith("verde.shopgot.v1.")) {
      check(Array.isArray(value) && value.every(item => isText(item) && ID.test(item)), "La lista de compra no es válida.");
      return;
    }
    check(isRecord(value), "Los datos de «" + key + "» no son válidos.");
    if (key === "verde.people.v1") {
      check(isText(value.active) && ID.test(value.active) && Array.isArray(value.list) && value.list.length > 0, "La lista de personas no es válida.");
      const ids = new Set();
      value.list.forEach(person => {
        check(isRecord(person) && isText(person.id) && ID.test(person.id) && isText(person.name) && person.name.trim().length > 0, "Hay una persona no válida en la copia.");
        check(!ids.has(person.id), "La copia contiene personas duplicadas.");
        ids.add(person.id);
      });
      check(ids.has(value.active), "La persona activa no existe en la copia.");
    } else if (key === "verde.recipes.v1") {
      Object.entries(value).forEach(([id, recipe]) => {
        check(ID.test(id) && isRecord(recipe) && isText(recipe.name) && isText(recipe.cat), "Hay una receta no válida en la copia.");
        checkItems(recipe.items, false);
        if (has(recipe, "emoji")) check(isText(recipe.emoji) && !/[<>"'&]/.test(recipe.emoji), "El icono de una receta no es válido.");
        if (has(recipe, "photo")) {
          check(isText(recipe.photo) && !/[<>"'\s]/.test(recipe.photo) && /^(?:https?:\/\/|\.?\/?[a-zA-Z0-9_-])/.test(recipe.photo) && !/^[^/]*:/.test(recipe.photo.replace(/^https?:/, "")), "La imagen de una receta no es válida.");
        }
      });
    } else if (key.startsWith("verde.profile.v1")) {
      check(has(value, "profile") || has(value, "goals"), "El perfil está vacío.");
      if (has(value, "profile")) {
        check(isRecord(value.profile), "El perfil no es válido.");
        ["weight", "height", "pasivo", "activo"].forEach(field => {
          if (has(value.profile, field)) check(isNumber(value.profile[field]), "Los valores del perfil no son válidos.");
        });
        if (has(value.profile, "sex")) check(isText(value.profile.sex), "El perfil no es válido.");
      }
      if (has(value, "goals")) {
        check(isRecord(value.goals), "Los objetivos no son válidos.");
        Object.values(value.goals).forEach(goal => {
          check(isRecord(goal) && Object.values(goal).every(isNumber), "Los objetivos no son válidos.");
        });
      }
    } else if (key.startsWith("verde.log.v2")) {
      if (has(value, "days")) {
        check(isRecord(value.days), "El historial no es válido.");
        Object.entries(value.days).forEach(([date, meals]) => {
          check(DATE.test(date), "La fecha de una comida no es válida.");
          checkItems(meals, true);
        });
      } else {
        check(isText(value.date) && DATE.test(value.date), "El historial no es válido.");
        checkItems(value.meals, true);
      }
    } else if (key.startsWith("ejercicios_v1")) {
      check(isRecord(value.workouts), "El historial de entrenamiento no es válido.");
      Object.entries(value.workouts).forEach(([date, workout]) => {
        check(DATE.test(date), "La fecha de un entrenamiento no es válida.");
        check(Array.isArray(workout) || isRecord(workout), "Un entrenamiento no es válido.");
        checkExercises(Array.isArray(workout) ? workout : workout.exercises);
        if (!Array.isArray(workout) && workout.duracion != null) check(isNumber(workout.duracion), "La duración no es válida.");
      });
      ["template", "templateB", "templateC"].forEach(field => {
        if (value[field] != null) checkExercises(value[field]);
      });
    }
  }

  // Pure validator; returns the complete, validated set of storage writes.
  function validateBackup(backup) {
    check(isRecord(backup) && backup.format === FORMAT && backup.version === 1, "Selecciona una copia JSON de Real Food compatible.");
    check(isText(backup.createdAt) && Number.isFinite(Date.parse(backup.createdAt)), "La fecha de la copia no es válida.");
    check(isRecord(backup.data) && Object.keys(backup.data).length > 0, "La copia no contiene datos.");
    checkTree(backup);
    check(new TextEncoder().encode(JSON.stringify(backup)).length <= MAX_BYTES, "La copia supera el límite de 5 MB.");
    const entries = Object.create(null);
    Object.entries(backup.data).forEach(([key, value]) => {
      check(knownKey(key), "La copia contiene datos ajenos a Real Food.");
      checkValue(key, value);
      entries[key] = JSON.stringify(value);
    });
    return entries;
  }

  function parseBackup(text) {
    check(isText(text) && new TextEncoder().encode(text).length <= MAX_BYTES, "La copia supera el límite de 5 MB.");
    let backup;
    try { backup = JSON.parse(text.replace(/^\uFEFF/, "")); }
    catch (_) { throw new Error("El archivo no es una copia JSON válida de Real Food. No se admiten archivos HTML."); }
    validateBackup(backup);
    return backup;
  }

  function createBackup(storage) {
    const data = Object.create(null);
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (knownKey(key)) {
        try { data[key] = JSON.parse(storage.getItem(key)); }
        catch (_) { throw new Error("No se pudo leer «" + key + "». No se ha generado una copia incompleta."); }
      }
    }
    const backup = { format: FORMAT, version: 1, createdAt: new Date().toISOString(), data };
    validateBackup(backup);
    return backup;
  }

  function applyBackup(storage, backup) {
    const entries = validateBackup(backup);
    const previous = Object.create(null);
    Object.keys(entries).forEach(key => { previous[key] = storage.getItem(key); });
    const written = [];
    try {
      Object.entries(entries).forEach(([key, value]) => {
        storage.setItem(key, value);
        written.push(key);
      });
    } catch (_) {
      let rollbackFailed = false;
      // Free the imported space first so restoring previous values can fit the quota.
      written.forEach(key => { try { storage.removeItem(key); } catch (_) { rollbackFailed = true; } });
      written.forEach(key => {
        if (previous[key] !== null) {
          try { storage.setItem(key, previous[key]); } catch (_) { rollbackFailed = true; }
        }
      });
      throw new Error(rollbackFailed
        ? "La importación falló y no se pudo restaurar todo el estado anterior. Conserva tu copia y no borres esta app."
        : "No se pudo guardar la copia. Se han conservado tus datos anteriores. Comprueba el espacio disponible y vuelve a intentarlo.");
    }
    return written.length;
  }

  root.RealFoodBackup = Object.freeze({ MAX_BYTES, knownKey, validateBackup, parseBackup, createBackup, applyBackup });
  if (!root.document) return;

  function mount() {
    const note = document.querySelector(".local-note");
    if (!note || document.getElementById("exportData")) return;
    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.id = "exportData";
    exportButton.className = "drawer-settings";
    exportButton.textContent = "Exportar mis datos";
    const importButton = document.createElement("button");
    importButton.type = "button";
    importButton.id = "importData";
    importButton.className = "drawer-settings";
    importButton.textContent = "Importar copia";
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.hidden = true;
    input.setAttribute("aria-label", "Seleccionar copia de Real Food");
    note.after(exportButton, importButton, input);

    exportButton.addEventListener("click", () => {
      try {
        const backup = createBackup(root.localStorage);
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        check(blob.size <= MAX_BYTES, "La copia supera el límite de 5 MB.");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "real-food-copia-" + backup.createdAt.slice(0, 10) + ".json";
        document.body.append(link);
        link.click();
        link.remove();
        root.setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch (error) { root.alert("No se pudo exportar. " + error.message); }
    });
    importButton.addEventListener("click", () => { input.value = ""; input.click(); });
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      importButton.disabled = true;
      try {
        check(/\.json$/i.test(file.name) && !/html/i.test(file.type), "Selecciona un archivo .json de Real Food. No se admiten archivos HTML.");
        check(file.size <= MAX_BYTES, "La copia supera el límite de 5 MB.");
        const backup = parseBackup(await file.text());
        const date = new Date(backup.createdAt).toLocaleDateString("es-ES");
        if (!root.confirm("¿Importar la copia del " + date + "?\n\nSustituirá los datos que coincidan con esta copia. Antes de continuar, exporta tus datos actuales si quieres conservarlos.\n\nLa app se recargará al terminar.")) return;
        applyBackup(root.localStorage, backup);
        root.alert("Copia importada. Tus datos ya están guardados en esta app.");
        root.location.reload();
      } catch (error) { root.alert("No se pudo importar. " + error.message); }
      finally { importButton.disabled = false; input.value = ""; }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})(typeof window !== "undefined" ? window : globalThis);
