#!/usr/bin/env node
var npmPackage = require('./package.json');
var bowerPackage = require('./bower.json');
var oldVersion = npmPackage.version;
var fs = require('fs');
var semver = require('semver');
var operation = process.argv[2];
var newVersion;
var exec = require('child_process').exec;
var yesno = require('yesno');
var colors = require('colors');

colors.setTheme({
  error: ['white', 'bold', 'bgRed'],
  warn: ['white', 'bold', 'bgYellow']
});
exec('[[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]] && echo "*"', function(err, stdout){
	if (stdout === "*\n"){
		throwError("Git directory not clean");
	}
	if (semver.valid(operation)){
		newVersion = semver.valid(operation);
	} else {
		newVersion = semver.inc(oldVersion, operation);
	}
	if (!newVersion){
		throwError("No version operation specified");
	}
	npmPackage.version = newVersion;
	bowerPackage.version = newVersion;
	exec('git branch | grep -i "\*" | sed -e "s/\* *//"', function(err, stdout){
		if (err) throwError(err);
		console.log("About to bump version number from "+oldVersion+" to " +newVersion);
		var branch = stdout;
		if (branch === 'master'){
			console.log('You are on the MASTER branch. Pushing this change will PUBLISH a new version.'.warn);
		}
		yesno.ask('Commit and push this change to git repo? Y/n', true, function(ok){
			if (ok){
				var newPreamble = fs.readFileSync('src/minified-preamble.txt').toString().replace(oldVersion, newVersion);
				fs.writeFileSync('src/minified-preamble.txt', newPreamble);
				fs.writeFileSync('package.json', JSON.stringify(npmPackage, null, 2));
				fs.writeFileSync('bower.json', JSON.stringify(bowerPackage, null, 2));
				exec('npm run build', function(){
					if (err) throwError(err);
					exec('git add -u && git commit -m "'+newVersion+'" && git tag v'+newVersion, function(err, stdout, stderr){
						if (err) throwError(err);
						if (err) throwError(stderr);
						console.log(stdout);
						exec('git push origin '+branch, function(err, stdout){
							console.log(stdout);
							exec('git push --tags', function(err, stdout){
								console.log(stdout);
								if (branch === 'master'){
								exec('npm publish', function(){
									process.exit();
								});
								} else {
									process.exit();
								}
							});
						});
					});
				});
			} else {
				console.log('not pushed');
				process.exit();
			}
		});


	});
});


function throwError(e){
	console.error("ERROR:".error, e);
	process.exit();
}
