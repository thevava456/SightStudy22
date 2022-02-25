# SightStudy
## Documentation React Native
https://reactnative.dev/docs/environment-setup

https://reactnative.dev/docs/running-on-device

## Installation des modules

Optionnel : `$ npm install -g react-native-cli`


`$ npm install --save` : 
Pour installer les nodes_modules

## Commande pour lancer le serveur de dévelloppement sur la tablette

`$ npm start` : 
Pour lancer le serveur de dévellopement.

Alertnative sans react-native-CLI : `$ npx react-native start`

## Dévelloppement Android sur une tablette physique

1. Connectez la tablette en USB et activez dans le mode dévellopeur > déboguage USB

Puis sur un nouveau terminal : 

2. `$ lsusb` : 
Récupérez les 4 premiers numéros du schéma suivant a0a0:b1b1 correpondant à l'appareil (ici : a0a0)

3. `$ echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="<LES_4_CHIFFRES_PRÉCÉDENTS>", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android-usb.rules ` 

4. `$ adb devices ` :
Si la configuration est corrrecte, le tag `Devices` doit apparaitre a droite de l'identifiant de votre appareil.

5. `$ npm run android` :
Pour installer l'application sur la tablette. Cette étape doit etre réitérée en cas d'installation d'un nouveau module.

Alertnative sans react-native-CLI : `$ npx react-native run-android`

## Dévelloppement Android sur un émulateur

1. Ouvrez android Studio et lancez l'émulateur ( Il sera nécessaire de donner les droits à l'application manuellement sur l'émulateur )

Puis sur un nouveau terminal : 

2. `$ npm run android` :
Pour installer l'application sur la tablette. Cette étape doit etre réitérée en cas d'installation d'un nouveau module.

Alertnative sans react-native-CLI : `$ npx react-native run-android`

### L'installation ci dessus fonctionne sur une machine Linux ( Ubuntu 20.10 ). En cas de problemes, référez vous à la documentation au début de cette notice. 

## Build une release et la publier sur App-center

### Build une release

`$ npm i`

`$ cd android && ./gradlew clean`

`$ ./gradlew assembleRelease`

### Publication sur App-center

1. Se connecter sur app center avec le compte Google.
2. Dans l'onglet Distribute > Releases, cliquez sur New Release et suivez les instructions.
3. Le lien a partager est situé en haut de la page Groups > Public Access. ( `install.appcenter.ms/users/sightstudy/apps/sightstudy/distribution_groups/public%20access` )

Attention : il ne faut pas activer le build automatique à chaque push sur la branche main. ( 4h de build max par mois gratuit sur App Center ) 

## Codes de connexion au compte Google pour les tablettes 

#### Compte gmail :

mail : noreply.sightstudy@gmail.com

mdp : s[...]s[...]p[...]

#### Compte Sendgrid :

mail : noreply.sightstudy@gmail.com

mdp : @S[...]s[...]p[...]13

Contactez Paul Jeandel / Melvin esteban pour plus d'informations
