_dir=$PWD    

# default config file
echo "default config file"
node .

echo "with -c $_dir/service.conf -C test-1 -p 2332"
node . -c $_dir/service.conf -C test-1 -p 2332