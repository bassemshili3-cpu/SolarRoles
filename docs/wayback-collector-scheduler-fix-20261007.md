# Collecteurs : suppression de l'attente globale CDX

Déploiement vérifié le 7 octobre 2026 à 09:13 UTC : PC et six VPS en `running`, 23 lots et 214 IP actives.

Le scheduler réservait une voie au CDX mais faisait attendre toutes les autres lorsque `pending` était vide. Les captures `retry` et `deferred` restaient alors inutilisées pendant chaque requête CDX lente. La sélection atomique des captures est maintenant accessible aux voies libres pendant l'inventaire. Les captures `pending` gardent la priorité ; les échéances `retryAt` restent respectées. Une seule voie peut poursuivre l'inventaire CDX d'un lot.

Le calcul du volume du tampon est partagé entre les voies pendant une seconde. Ce cache borné évite les lectures SQLite répétées ; des requêtes déjà en vol et cette seconde de cache peuvent dépasser légèrement le plafond avant la prochaine lecture. Les limites disque, quota, cadence et Retry-After restent appliquées.

Les checkpoints ont été sauvegardés après arrêt, avec `PRAGMA quick_check = ok`, et les fichiers de cadence conservés. Sauvegardes : `.tools/wayback-cloud/scheduler-backup-20261007` sur chaque machine ; celles d'UpCloud 4 CPU sont conservées sur le PC dans `.tools/wayback-cloud/upcloud4-scheduler-backup-20261007.tgz`, archive vérifiée, afin de restaurer sa marge disque (18,17 Gio après déplacement). Civo a continué le tri.

Mesure Infomaniak 2 après correction : 820 requêtes supplémentaires entre 09:06:48.336 et 09:08:29.084 UTC, soit 8,14 req/s. Aucun 429 enregistré sur ce nouveau processus au second relevé. Cette fenêtre ne constitue pas une garantie de débit durable : les limites de tampon et les réponses Wayback restent variables.

Validation : 13 tests réussis (scheduler, revendications atomiques, nettoyage durable, blocs adaptatifs). Deux contrôles d'intégration supplémentaires réussissent (groupement et réduction CDX après erreurs). Un contrôle existant de `wayback-raw-retry-priority.test.mjs` échoue sur le compteur final `reusedCaptures` (0 attendu 1) : les assertions précédentes sur les routes, statuts, tentatives et réutilisation du corps passent ; le compteur du rapport est mis en cache pendant 60 secondes. Ce problème de rapport reste distinct du correctif de concurrence.

SHA-256 du collecteur vérifié sur les six VPS : `94928be3f54d6450433faa599b36735b6301760ce19b3fb0eba78e0276f6fa3f`.
