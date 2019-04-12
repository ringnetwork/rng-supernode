rm -rf ./node_modules/rng-core/
mkdir -p ./node_modules/rng-core/ 
rsync -rv --exclude=.git --exclude=node_modules --exclude=.idea ../rng-core/ ./node_modules/rng-core/
echo done!
