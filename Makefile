CSS_PATH =	"src/dictionary-styles.css"
DICT_NAME =	"Wallace Dictionary"
DICT_SRC_PATH	=	"build/scraped.xml"
PLIST_PATH =	"src/dictionary-info.plist"

DICT_BUILD_TOOL_DIR =	"./vendor/Dictionary Development Kit"
DICT_BUILD_TOOL_BIN =	"$(DICT_BUILD_TOOL_DIR)/bin"

DICT_DEV_KIT_OBJ_DIR =	./objects
export	DICT_DEV_KIT_OBJ_DIR

DESTINATION_FOLDER = ~/Library/Dictionaries
RM = /bin/rm

all: scrape
	"$(DICT_BUILD_TOOL_BIN)/build_dict.sh" $(DICT_NAME) $(DICT_SRC_PATH) $(CSS_PATH) $(PLIST_PATH)
	echo "Done."

scrape:
	/usr/bin/env node -r ts-node/register/transpile-only ./src/main.ts $(DICT_SRC_PATH)

install:
	$(RM) -rf $(DESTINATION_FOLDER)/$(DICT_NAME).dictionary
	echo "Installing into $(DESTINATION_FOLDER)".
	mkdir -p $(DESTINATION_FOLDER)
	ditto --noextattr --norsrc $(DICT_DEV_KIT_OBJ_DIR)/$(DICT_NAME).dictionary  $(DESTINATION_FOLDER)/$(DICT_NAME).dictionary
	touch $(DESTINATION_FOLDER)
	echo "Done."
	echo "To test the new dictionary, try Dictionary.app."

clean:
	$(RM) -rf $(DICT_DEV_KIT_OBJ_DIR)
	$(RM) -rf $(DICT_SRC_PATH)
