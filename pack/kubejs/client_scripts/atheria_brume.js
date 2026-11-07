// Atheria : brume de la zone contaminée et du marécage pollué (distance de brouillard rapprochée, en douceur).
var ATHERIA_BRUME = { cible: 0, valeur: 0, tick: 0 }
var ATHERIA_BRUME_BIOMES = { 'atheria:zone_contaminee': 1.0, 'atheria:marecage_pollue': 0.45 }

ClientEvents.tick(event => {
  var mc = Client
  if (!mc.player || !mc.level) { ATHERIA_BRUME.cible = 0; ATHERIA_BRUME.valeur = 0; return }
  ATHERIA_BRUME.tick++
  if (ATHERIA_BRUME.tick % 20 == 0) {
    var cle = mc.level.getBiome(mc.player.blockPosition()).unwrapKey()
    var nom = cle.isPresent() ? '' + cle.get().location() : ''
    ATHERIA_BRUME.cible = ATHERIA_BRUME_BIOMES[nom] || 0
  }
  ATHERIA_BRUME.valeur += (ATHERIA_BRUME.cible - ATHERIA_BRUME.valeur) * 0.03
})

NativeEvents.onEvent('net.neoforged.neoforge.client.event.ViewportEvent$RenderFog', event => {
  var v = ATHERIA_BRUME.valeur
  if (v < 0.01) return
  var loin = event.getFarPlaneDistance()
  var cible = Math.min(loin, 72)
  event.setFarPlaneDistance(loin + (cible - loin) * v)
  event.setNearPlaneDistance(event.getNearPlaneDistance() * (1 - v))
  event.setCanceled(true)
})
