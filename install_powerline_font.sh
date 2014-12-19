mkdir /tmp/git-clone
git clone https://github.com/Lokaltog/powerline-fonts /tmp/powerline-fonts
sudo mv /tmp/powerline-fonts /usr/share/fonts/powerline-fonts
sudo fc-cache -v -f
