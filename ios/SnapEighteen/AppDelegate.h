#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper
@property (nonatomic, assign) UIBackgroundTaskIdentifier taskIdentifier;

@end
