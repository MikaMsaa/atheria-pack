// Atheria : la touche K ouvre l'arbre de compétences. Le menu rapide d'Emotecraft passe sur F7, une seule fois, aussi chez les joueurs déjà installés.
var ATHERIA_TOUCHE_EMOTE_FICHIER = 'kubejs/config/atheria_touche_emote.json'
var atheriaToucheEmoteAttente = 60
ClientEvents.tick(event => {
  if (atheriaToucheEmoteAttente < 0 || !Client.player) return
  if (--atheriaToucheEmoteAttente >= 0) return
  try {
    if (JsonIO.read(ATHERIA_TOUCHE_EMOTE_FICHIER)) return
    var Input = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
    Client.options.keyMappings.forEach(k => {
      var nom = String(k.getName())
      if (nom == 'key.emotecraft.fastchoose') Client.options.setKey(k, Input.getKey('key.keyboard.f7'))
      else if (nom == 'key.puffish_skills.open') Client.options.setKey(k, Input.getKey('key.keyboard.k'))
    })
    Java.loadClass('net.minecraft.client.KeyMapping').resetMapping()
    Client.options.save()
    JsonIO.write(ATHERIA_TOUCHE_EMOTE_FICHIER, { fait: true })
  } catch (e) {
    console.error('[Atheria touches] ' + e)
  }
})